import { Logger } from "cables-shared-client";
import GPUBuffer from "./cgp_gpubuffer.js";
import { WebGpuContext } from "./cgp_state.js";
import Uniform from "./cgp_uniform.js";
import Shader from "./cgp_shader.js";
import CgUniform from "../cg/cg_uniform.js";

export default class Binding
{
    #name = "";
    #options = {};

    /** @type {WebGpuContext} */
    #cgp = null;

    /** @type {Array<Uniform>} */
    uniforms = [];

    /** @type {Array<GPUBuffer>} */
    cGpuBuffers = [];

    /** @type {Shader} */
    shader = null;

    bindingInstances = [];
    stageStr = "";
    bindingType = "uniform";
    isValid = true;
    changed = 0;
    #index = -1;

    define = "";

    /**
     * Description
     * @param {WebGpuContext} cgp
     * @param {String} name
     * @param {Object} options={}
     */
    constructor(cgp, name, options = {})
    {
        this._log = new Logger("cgp_binding");
        if (typeof options != "object") this._log.error("binding options is not an object");

        this.#name = name;
        this.#cgp = cgp;
        this.#options = options;
        this.define = options.define || "";
        this.stageStr = options.stage;
        if (options.bindingType) this.bindingType = options.bindingType; // "uniform", "storage", "read-only-storage",
        if (this.stageStr == "frag") this.stage = GPUShaderStage.FRAGMENT;
        else this.stage = GPUShaderStage.VERTEX;
        if (options.hasOwnProperty("index")) this.#index = options.index;
        if (options.shader) this.shader = options.shader;

        if (this.shader)
        {
            if (this.stageStr == "frag") this.shader.bindingsFrag.push(this);
            if (this.stageStr == "vert") this.shader.bindingsVert.push(this);
            if (this.#index == -1) this.#index = this.shader.getNewBindingIndex();
        }

        if (this.#index == -1) this._log.warn("binding could not get an index", this.#name);

        this.#cgp.on("deviceChange", () =>
        {
            // this.reInit();
        });
    }

    isStruct()
    {
        if (this.uniforms.length == 0) return false;

        if (this.uniforms.length == 1)
        {
            if (this.uniforms[0].type == "t" || this.uniforms[0].type == "sampler") return false;
            if (this.bindingType != "uniform") return false;
        }

        return true;
    }

    /**
     * @param {Shader} newShader
     * @returns {Binding}
     */
    copy(newShader)
    {
        const options = {};

        for (const i in this.#options)
            options[i] = this.#options[i];

        options.shader = newShader;

        let binding = new Binding(this.#cgp, this.#name, options);

        for (let i = 0; i < this.uniforms.length; i++)
        {
            binding.addUniform(newShader.getUniform(this.uniforms[i].name)); // .copy(newShader)
        }

        return binding;
    }

    /**
     * @param {Uniform} uni
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
        return size;
    }

    getShaderHeaderCode()
    {
        let str = "";
        let typeStr = "strct_" + this.#name;
        let name = this.#name;

        if (!this.isActive)
        {
            str += "// " + typeStr + " " + this.#name + ": excluded because define " + this.#options.define + "\n";
            return str;
        }

        if (this.uniforms.length === 0) return "// no uniforms in bindinggroup...?\n";

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

        str += "@group(0) ";
        str += "@binding(" + this.#index + ") ";

        if (this.isStruct())
        {
            str += "var<" + this.bindingType + "> ";
        }
        else if (this.bindingType == "read-only-storage")str += "var<storage,read> ";
        else str += "var ";

        str += name + ": " + typeStr + ";\n";

        // if (this.#options.define) str += "#endif\n";

        return str;
    }

    getBindingGroupLayoutEntry()
    {
        if (!this.isActive)
        {
            console.log("not activeeee " + this.#name);
            return null;
        }

        let label = "layout " + this.#name + " [";
        for (let i = 0; i < this.uniforms.length; i++) label += this.uniforms[i].getName() + ",";
        label += "]";

        const o = {
            "label": label,
            "binding": this.#index,
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

    get isActive()
    {
        if (!this.define) return true;
        if (this.define && !this.shader.hasDefine(this.define)) return false;
        return true;
    }

    /**
     * @param {number} inst
     */
    getBindingGroupEntry(inst)
    {
        if (!this.isActive) return null;
        this.isValid = false;

        const o = {
            "label": this.#name + " binding",
            "binding": this.#index,
            "size": this.getSizeBytes(),
            "visibility": this.stage,
        };

        if (this.uniforms.length == 0)
        {
            this._log.log("binding uniforms length 0");
            return;
        }

        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            if (this.uniforms[0].getValue() && this.uniforms[0].getValue().gpuTexture) o.resource = this.uniforms[0].getValue().gpuTexture.createView();
            else o.resource = this.#cgp.getEmptyTexture().createView();// CABLES.emptyCglTexture.createView();

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
                    const sampler = this.uniforms[0]._cgp.device.createSampler(smplDesc);
                    if (sampler)o.resource = sampler;

                }

            }
        }
        else
        {
            this._createCgpuBuffer(inst);

            o.resource = {
                "buffer": this.cGpuBuffers[inst].gpuBuffer,
                "minBindingSize": this.getSizeBytes(),
                "hasDynamicOffset": 0
            };
        }

        this.isValid = true;
        this.bindingInstances[inst] = o;

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
            "usage": GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM,
        };

        if (this.bindingType == "read-only-storage" || this.bindingType == "storage") buffCfg.usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;
        if (this.cGpuBuffers[inst]) this.cGpuBuffers[inst].dispose();
        this.cGpuBuffers[inst] = new GPUBuffer(this.#cgp, this.#name + " buff", null, { "buffCfg": buffCfg });

        if (this.uniforms.length > 0 && this.uniforms[0].gpuBuffer) this.cGpuBuffers[inst] = this.uniforms[0].gpuBuffer;
    }

    /**
     * @param {WebGpuContext} cgp
     * @param {Number} bindingIndex
     */
    update(cgp, bindingIndex)
    {
        if (!this.isActive) return;

        let b = this.bindingInstances[bindingIndex];
        if (!b) b = this.getBindingGroupEntry(bindingIndex);

        if (this.uniforms.length == 1 && this.uniforms[0].gpuBuffer)
        {
            if (this.uniforms[0].gpuBuffer != this.cGpuBuffers[bindingIndex])
            {
                this._log.log("changed?!");
                this.shader._needsRecompile = true; // TODO this should actually just rebuild the bindinggroup i guess ?
            }

            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.push("extern uni bind", [this.uniforms[0].getName(), this.cGpuBuffers[bindingIndex].floatArr]);
            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.pop();
        }
        else
        if (this.uniforms.length == 1 && this.uniforms[0].getType() == "t")
        {
            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.push("uni texture");
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

            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.pop();
        }
        else if (this.uniforms.length == 1 && this.uniforms[0].getType() == "sampler")
        {
            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.push("uni sampler");
            b.resource = this.uniforms[0].getValue();
            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.pop();
        }
        else
        {
            let info = ["stage " + this.stageStr + " / inst " + bindingIndex];

            // this._log.log("B",this.);
            // update uniform values to buffer
            const s = this.getSizeBytes() / 4;

            // if (!this.cGpuBuffers[inst])
            // this._createCgpuBuffer(inst);
            // this.cGpuBuffers[inst] = new GPUBuffer(this._cgp, "buff", null, { "buffCfg": buffCfg });

            if (!this.cGpuBuffers[bindingIndex])
            {
                // console.log("no cpubuff?");
                return;
            }
            this.cGpuBuffers[bindingIndex].setLength(s);

            let off = 0;
            for (let i = 0; i < this.uniforms.length; i++)
            {
                info.push(this.uniforms[i].getName() + " " + this.uniforms[i].getValue());
                this.uniforms[i].copyToBuffer(this.cGpuBuffers[bindingIndex].floatArr, off); // todo: check if uniform changed?

                // if (isNaN(this.cGpuBuffers[inst].floatArr[0]))
                // {
                // this._log.log("shitttttttt", this.cGpuBuffers[inst].floatArr[0], this.uniforms[i].getName(), this.cGpuBuffers[inst].name, this.uniforms[i]);
                // }

                off += this.uniforms[i].getSizeBytes() / 4;
            }
            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.push("uni buff", info);

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

            if (this.#cgp.frameStore.branchProfiler) this.#cgp.frameStore.branchStack.pop();
        }
    }
}
