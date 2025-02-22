import { Logger } from "cables-shared-client";
import { CgpGguBuffer } from "./cgp_gpubuffer.js";
import { CgpContext } from "./cgp_state.js";
import { CgpUniform } from "./cgp_uniform.js";
import { CgpShader } from "./cgp_shader.js";

/**
     * @typedef CgpBindingOptions
     * @property {string} bindingType  "uniform", "storage", "read-only-storage","read-write-storage",
     * @property {string} [define]
     * @property {CgpShader} shader
     * @property {number} stage
     * @property {number} index
     */

export class Binding
{
    #name = "";
    #options = {};

    /** @type {CgpContext} */
    #cgp = null;

    /** @type {Array<CgpUniform>} */
    uniforms = [];

    /** @type {Array<CgpGguBuffer>} */
    cGpuBuffers = [];

    /** @type {CgpShader} */
    #shader = null;

    /** @type {Array<GPUBindGroupEntry>} */
    bindingInstances = [];

    bindingType = "uniform";
    isValid = true;
    changed = 0;
    #index = -1;

    define = "";

    /**
     * Description
     * @param {CgpContext} cgp
     * @param {String} name
     * @param {CgpShader} shader
     * @param {CgpBindingOptions} [options]
     */
    constructor(cgp, name, options)
    {
        this._log = new Logger("cgp_binding");
        if (!options) this._log.error("binding options is not an object", name);

        this.#name = name;
        this.#cgp = cgp;
        this.#options = options || {};
        this.define = this.#options.define || "";
        if (this.#options.bindingType) this.bindingType = this.#options.bindingType;
        this.stage = options.stage;
        // if (options.hasOwnProperty("index")) this.#index = options.index;
        this.#shader = options.shader;

        if (this.#shader)
        {
            if (this.stage == GPUShaderStage.FRAGMENT) this.#shader.bindingsFrag.push(this);
            else if (this.stage == GPUShaderStage.VERTEX) this.#shader.bindingsVert.push(this);
            else if (this.stage == GPUShaderStage.COMPUTE) this.#shader.bindingsCompute.push(this);
            else this._log.warn("unknown shader stage binding");

            // if (this.#index == -1) this.#index = this.shader.getNextBindingCounter();
        }

        // if (this.#index == -1) this._log.warn("binding could not get an index", this.#name);

        this.#cgp.on("deviceChange", () =>
        {
            // this.reInit();
        });
    }

    getStageString()
    {
        if (this.stage == GPUShaderStage.FRAGMENT) return "fragment";
        if (this.stage == GPUShaderStage.VERTEX) return "vertex";
        if (this.stage == GPUShaderStage.COMPUTE) return "compute";
        return "unknown";
    }

    getInfo()
    {
        return { "class": this.constructor.name, "name": this.#name, "stage": this.getStageString(), "bindingType": this.bindingType, "numUniforms": this.uniforms.length, "bindingIndex": this.getBindingIndex() };
    }

    getBindingIndex()
    {
        if (this.#index == -1)
            this.#index = this.#shader.getNextBindingCounter();

        return this.#index;
    }

    isStruct()
    {
        if (this.bindingType != "uniform") return false;
        if (this.uniforms.length == 0) return false;

        if (this.uniforms.length == 1)
        {
            if (this.uniforms[0].type == "t" || this.uniforms[0].type == "sampler") return false;
        }

        return true;
    }

    /**
     * @param {CgpShader} newShader
     * @returns {Binding}
     */
    copy(newShader)
    {
        const options = {};

        for (const i in this.#options)
            options[i] = this.#options[i];

        options.shader = newShader;

        let binding = new Binding(this.#cgp, this, this.#name);

        for (let i = 0; i < this.uniforms.length; i++)
        {
            binding.addUniform(newShader.getUniform(this.uniforms[i].name)); // .copy(newShader)
        }

        return binding;
    }

    /**
     * @param {CgpUniform} uni
     */
    addUniform(uni)
    {
        this.uniforms.push(uni);
    }

    getSizeBytes()
    {
        let size = 0;
        for (let i = 0; i < this.uniforms.length; i++)
        {
            // this._log.log("UNIFORM!!!", i, this.uniforms[i], this.uniforms[i].getSizeBytes());
            // this._log.log("getSizeBytes", this.uniforms[i], this.uniforms[i].getSizeBytes);
            size += this.uniforms[i].getSizeBytes();
        }
        // if (this.uniforms.length == 0)this._log.log("NO UNIFORMS!!!");

        if (this.uniforms.length == 0 && this.bindingType != "uniform")
        {
            return 300;
        }
        return size;
    }

    getShaderHeaderCode()
    {
        let str = "";
        let name = this.#name;
        let typeStr = "";

        if (!this.isActive)
        {
            str += "// " + typeStr + " " + this.#name + ": excluded because define " + this.#options.define + "\n";
            return str;
        }

        str += "// bindingType:" + this.bindingType + "\n";
        str += "// uniforms:" + this.uniforms.length + "\n";

        if (this.uniforms.length == 0 && this.bindingType == "uniform") return str + "// nothing.... \n\n";

        if (this.uniforms.length > 0)
        {
            typeStr = "strct_" + this.#name;
            str += "// " + this.uniforms.length + " uniforms\n";

            if (this.isStruct())
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
        }

        if (this.bindingType.includes("storage") && this.uniforms.length == 0)
        {
            typeStr = "array<f32>";
        }

        str += "@group(0) ";
        str += "@binding(" + this.getBindingIndex() + ") ";

        if (this.#options.gpuBuffer)
        {
            str += "var<storage,read_write> ";
        }
        else
        if (this.isStruct())
        {
            str += "var<" + this.bindingType + "> ";
        }
        else if (this.bindingType == "read-only-storage")str += "var<storage,read> ";
        else if (this.bindingType == "read-write")str += "var<storage,read_write> ";
        else
        {
            str += "var ";
            str += "/* unknown bindingtype: " + this.bindingType + " */";
        }

        str += name + ": " + typeStr + ";\n";

        // @group(0) @binding(0) var<storage, read_write> resultMatrix : array<f32>;

        // if (this.#options.define) str += "#endif\n";

        return str + "\n";
    }

    /** @returns {GPUBindGroupLayoutEntry} */
    getBindingGroupLayoutEntry()
    {

        if (!this.isActive)
        {
            console.log("binding", this.#name, "not active");
            return null;
        }

        let label = "layout " + this.#name + " [";
        for (let i = 0; i < this.uniforms.length; i++) label += this.uniforms[i].getName() + ",";
        label += "]";

        const o = {
            "label": label,
            "binding": this.getBindingIndex(),
            "visibility": this.stage,
            "size": this.getSizeBytes()
        };

        if (this.#options.gpuBuffer)
        {
            o.buffer = this.#options.gpuBuffer.gpuBuffer;
            o.buffer.type = this.bindingType;
        }
        else
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

    get isActive()
    {
        if (!this.define) return true;
        if (this.define && !this.#shader.hasDefine(this.define)) return false;
        return true;
    }

    /**
     * @param {CgpShader} shader
     * @returns {GPUBindGroupEntry}
     */
    getBindingGroupEntry()
    {

        if (!this.isActive) return null;
        this.isValid = false;

        /** @type {GPUBindGroupEntry} */
        const o = {
            "label": this.#name + " binding",
            "binding": this.getBindingIndex(),
            "size": this.getSizeBytes(),
            "visibility": this.stage
        };

        // if (this.uniforms.length == 0)
        // {
        //     console.log("binding uniforms length 0", this);
        //     return;
        // }

        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            if (this.uniforms[0].getValue() && this.uniforms[0].getValue().gpuTexture) o.resource = this.uniforms[0].getValue().gpuTexture.createView();
            else o.resource = this.#cgp.getEmptyTexture().createView();
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
            let smplDesc = {
                "addressModeU": "mirror-repeat",
                "addressModeV": "mirror-repeat",
                "magFilter": "linear",
                "minFilter": "linear",
                "mipmapFilter": "linear",
            };

            if (this.uniforms[0].getValue())
            {
                if (!this.uniforms[0].getValue().getSampler)
                {
                    this._log.error("uniform texture does not have function getSampler... not a WebGpu Texture?");
                }
                else
                {
                    smplDesc = this.uniforms[0].getValue().getSampler();
                    const sampler = this.#cgp.device.createSampler(smplDesc);
                    if (sampler)o.resource = sampler;
                }
            }
        }
        else
        {

            console.log("create bufferrrrrrr", this.getBindingIndex(), this.#name);

            this._createCgpuBuffer(this.getBindingIndex());
            o.resource = {
                "buffer": this.cGpuBuffers[this.getBindingIndex()].gpuBuffer,
                "minBindingSize": this.getSizeBytes(),
                "hasDynamicOffset": 0
            };
        }

        this.isValid = true;

        this.bindingInstances[this.getBindingIndex()] = o;

        // if (o.hasOwnProperty("resource"))
        // {
        //     console.log("rrrrrr ", o.label, o.resource);
        // }

        return o;
    }

    _createCgpuBuffer(inst)
    {
        let buffCfg = {
            "label": this.#name,
            "size": this.getSizeBytes(),
        };

        if (this.bindingType == "read-write-storage") buffCfg.usage = GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC;
        else if (this.bindingType == "read-only-storage" || this.bindingType == "storage") buffCfg.usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;
        else if (this.bindingType == "uniform") buffCfg.usage = GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM;
        else this._log.warn("unknown binding type", this.bindingType);

        if (this.cGpuBuffers[inst]) this.cGpuBuffers[inst].dispose();

        // if (this.uniforms.length > 0 && this.uniforms[0].gpuBuffer) this.cGpuBuffers[inst] = this.uniforms[0].gpuBuffer;
        // else
        this.cGpuBuffers[inst] = new CgpGguBuffer(this.#cgp, this.#name + " buff", null, { "buffCfg": buffCfg });
    }

    /**
     * @param {Number} bindingIndex
     */
    update()
    {

        let bindingIndex = this.getBindingIndex();

        if (!this.isActive) return;

        let b = this.bindingInstances[bindingIndex];
        if (!b) b = this.getBindingGroupEntry(bindingIndex);

        if (this.uniforms.length == 1 && this.uniforms[0].gpuBuffer)
        {
            if (this.uniforms[0].gpuBuffer != this.cGpuBuffers[bindingIndex])
            {
                this._log.log("changed?!");
                // this.#shader.setWhyCompile("binding update"); // TODO this should actually just rebuild the bindinggroup i guess ?
            }

            if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.push("binding update uni", this.uniforms[0].getName(), { "uni": this.uniforms[0].getInfo(), "data": this.cGpuBuffers[bindingIndex].floatArr });
            if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.pop();
        }
        else
        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.push("binding update uni texture", "texture " + this.uniforms[0].getName(), { "uni": this.uniforms[0].getInfo() });
            if (this.uniforms[0].getValue())
                if (this.uniforms[0].getValue().gpuTexture)
                {
                    this.bindingInstances[bindingIndex] = this.getBindingGroupEntry(bindingIndex);
                }
                else
                {
                    this._log.log("uni t has no gputexture");
                    b.resource = this.#cgp.getErrorTexture().createView();
                }

            if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.pop();
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
            if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.push("binding update uni sampler");
            b.resource = this.uniforms[0].getValue();
            if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.pop();
        }
        else
        {
            let info = { "name": this.uniforms.length + " uniforms", "stage ": CgpShader.getStageString(this.stage), "bindingIndex": bindingIndex, "uniforms": [] };

            // this._log.log("B",this.);
            // update uniform values to buffer
            const s = this.getSizeBytes() / 4;

            // if (!this.cGpuBuffers[inst])
            // this._createCgpuBuffer(inst);
            // this.cGpuBuffers[inst] = new GPUBuffer(this._cgp, "buff", null, { "buffCfg": buffCfg });

            if (!this.cGpuBuffers[bindingIndex])
            {
                console.log("no cpubuff? ", this.stage, this.#name);
                return;
            }
            this.cGpuBuffers[bindingIndex].setLength(s);

            let off = 0;
            for (let i = 0; i < this.uniforms.length; i++)
            {
                this.uniforms[i].copyToBuffer(this.cGpuBuffers[bindingIndex].floatArr, off); // todo: check if uniform changed?

                // console.log(this.cGpuBuffers[bindingIndex].floatArr);

                info.uniforms.push(this.uniforms[i].getInfo());

                // if (isNaN(this.cGpuBuffers[inst].floatArr[0]))
                // {
                // this._log.log("s", this.cGpuBuffers[inst].floatArr[0], this.uniforms[i].getName(), this.cGpuBuffers[inst].name, this.uniforms[i]);
                // }

                off += this.uniforms[i].getSizeBytes() / 4;
            }
            if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.push("binding update buff", this.getStageString() + " " + this.bindingType, { "info": info });

            // this._log.log("upodate", inst);

            this.cGpuBuffers[bindingIndex].updateGpuBuffer();
            // todo: only if changed...
            // cgp.device.queue.writeBuffer(
            //     b.resource.buffer,
            //     0,
            //     this._buffer.buffer,
            //     this._buffer.byteOffset,
            //     this._buffer.byteLength
            // );

            if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.pop();
        }
    }
}
