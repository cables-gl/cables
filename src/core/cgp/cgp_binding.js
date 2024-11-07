import { Logger } from "cables-shared-client";
import GPUBuffer from "./cgp_gpubuffer.js";

export default class Binding
{
    /**
     * Description
     * @param {any} cgp
     * @param {any} idx
     * @param {string} name
     * @param {any} options={}
     */
    constructor(cgp, name, options = {})
    {
        if (typeof options != "object") this._log.error("binding options is not an object");
        this._index = -1;

        this._name = name;
        this._cgp = cgp;
        this._log = new Logger("cgp_binding");
        this.uniforms = [];
        this.cGpuBuffers = [];
        this.shader = null;
        this.bindingInstances = [];
        this.stageStr = options.stage;
        this.bindingType = options.bindingType || "uniform"; // "uniform", "storage", "read-only-storage",

        if (this.stageStr == "frag") this.stage = GPUShaderStage.FRAGMENT;
        else this.stage = GPUShaderStage.VERTEX;
        if (options.hasOwnProperty("index")) this._index = options.index;

        if (options.shader) this.shader = options.shader;

        this._buffer = null;
        this.isValid = true;
        this.changed = 0;

        if (this.shader)
        {
            if (this.stageStr == "frag") this.shader.bindingsFrag.push(this);
            if (this.stageStr == "vert") this.shader.bindingsVert.push(this);
            if (this._index == -1) this._index = this.shader.getNewBindingIndex();
        }

        if (this._index == -1) this._log.warn("binding could not get an index", this._name);

        this._cgp.on("deviceChange", () =>
        {
            // this.reInit();
        });
    }

    addUniform(uni)
    {
        this.uniforms.push(uni);
    }

    getSizeBytes()
    {
        let size = 0;
        for (let i = 0; i < this.uniforms.length; i++)
        {
            // console.log("UNIFORM!!!", i, this.uniforms[i], this.uniforms[i].getSizeBytes());
            // console.log("getSizeBytes", this.uniforms[i], this.uniforms[i].getSizeBytes);
            size += this.uniforms[i].getSizeBytes();
        }
        // if (this.uniforms.length == 0)console.log("NO UNIFORMS!!!");
        return size;
    }

    getShaderHeaderCode()
    {
        let str = "";

        let typeStr = "str_" + this._name;
        let name = this._name;

        if (this.uniforms.length === 0) return "// no uniforms in bindinggroup...?\n";

        if (this.uniforms.length > 1)
        {
            str += "struct " + typeStr + "\n";
            str += "{\n";
            for (let i = 0; i < this.uniforms.length; i++)
            {
                str += "    " + this.uniforms[i].name + ": " + this.uniforms[i].getWgslTypeStr();
                if (i != this.uniforms.length - 1)str += ",";
                str += "\n";
            }
            str += "};\n";
        }
        else
        {
            typeStr = this.uniforms[0].getWgslTypeStr();
            name = this.uniforms[0].name;
        }

        let bindingType = this.bindingType;


        str += "@group(0) ";
        str += "@binding(" + this._index + ") ";

        if (this.uniforms.length > 1)
        {
            str += "var<" + bindingType + "> ";
        }
        else if (this.bindingType == "read-only-storage")str += "var<storage,read> ";
        else str += "var ";


        str += name + ": " + typeStr + ";\n";


        return str;
    }


    getBindingGroupLayoutEntry()
    {
        let label = "layout " + this._name + " [";
        for (let i = 0; i < this.uniforms.length; i++) label += this.uniforms[i].getName() + ",";
        label += "]";

        const o = {
            "label": label,
            "binding": this._index,
            "visibility": this.stage,
            "size": this.getSizeBytes()
        };

        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            o.texture = {};
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
            o.sampler = {};
        }
        else
        {
            o.buffer = {};
            o.buffer.type = this.bindingType;
        }

        return o;
    }

    getBindingGroupEntry(gpuDevice, inst)
    {
        this.isValid = false;

        const o = {
            "label": this._name + " binding",
            "binding": this._index,
            "size": this.getSizeBytes(),
            "visibility": this.stage,
        };

        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            if (this.uniforms[0].getValue() && this.uniforms[0].getValue().gpuTexture) o.resource = this.uniforms[0].getValue().gpuTexture.createView();
            else o.resource = this._cgp.getEmptyTexture().createView();// CABLES.emptyCglTexture.createView();
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
            const sampler = this.uniforms[0]._cgp.device.createSampler({
                "addressModeU": "repeat",
                "addressModeV": "repeat",
                "magFilter": "linear",
                "minFilter": "linear",
                "mipmapFilter": "linear",
            });
            o.resource = sampler;
        }
        else
        {
            let buffCfg = {
                "label": this._name,
                "size": this.getSizeBytes(),
                "usage": GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
            };

            if (this.bindingType == "read-only-storage" || this.bindingType == "storage") buffCfg.usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;

            if (this.cGpuBuffers[inst]) this.cGpuBuffers[inst].dispose();
            this.cGpuBuffers[inst] = new GPUBuffer(this._cgp, "buff", null, { "buffCfg": buffCfg });

            if (this.uniforms[0].gpuBuffer) this.cGpuBuffers[inst] = this.uniforms[0].gpuBuffer;

            o.resource = {
                "buffer": this.cGpuBuffers[inst].gpuBuffer,
                "minBindingSize": this.getSizeBytes(),
                "hasDynamicOffset": 0
            };
        }

        this.isValid = true;
        this.bindingInstances[inst] = o;

        return o;
    }



    update(cgp, inst)
    {
        let b = this.bindingInstances[inst];
        if (!b) b = this.getBindingGroupEntry(cgp.device, inst);

        if (this.uniforms.length == 1 && this.uniforms[0].gpuBuffer)
        {
            if (this.uniforms[0].gpuBuffer != this.cGpuBuffers[inst])
            {
                console.log("changed?!");
                this.shader._needsRecompile = true; // TODO this should actually just rebuild the bindinggroup i guess ?
            }

            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.push("extern uni bind", [this.uniforms[0].getName(), this.cGpuBuffers[inst].floatArr]);
            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.pop();
        }
        else
        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.push("uni texture");
            if (this.uniforms[0].getValue())
                if (this.uniforms[0].getValue().gpuTexture)
                {
                    this.bindingInstances[inst] = this.getBindingGroupEntry(this.uniforms[0]._cgp.device, inst);
                }
                else
                {
                    b.resource = CABLES.errorTexture.createView();
                }

            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.pop();
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.push("uni sampler");
            b.resource = this.uniforms[0].getValue();
            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.pop();
        }
        else
        {
            let info = ["stage " + this.stageStr + " / inst " + inst];

            // console.log("B",this.);


            // update uniform values to buffer
            const s = this.getSizeBytes() / 4;
            this.cGpuBuffers[inst].setLength(s);

            let off = 0;
            for (let i = 0; i < this.uniforms.length; i++)
            {
                info.push(this.uniforms[i].getName() + " " + this.uniforms[i].getValue());
                this.uniforms[i].copyToBuffer(this.cGpuBuffers[inst].floatArr, off); // todo: check if uniform changed?
                off += this.uniforms[i].getSizeBytes() / 4;
            }
            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.push("uni buff", info);


            // console.log("upodate", inst);

            this.cGpuBuffers[inst].updateGpuBuffer();
            // todo: only if changed...
            // cgp.device.queue.writeBuffer(
            //     b.resource.buffer,
            //     0,
            //     this._buffer.buffer,
            //     this._buffer.byteOffset,
            //     this._buffer.byteLength
            // );

            if (this._cgp.frameStore.branchProfiler) this._cgp.frameStore.branchStack.pop();
        }
    }
}
