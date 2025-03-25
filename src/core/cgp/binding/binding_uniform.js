import { Binding } from "./binding.js";
import { CgpUniform } from "../cgp_uniform.js";
import { CgpGguBuffer } from "../cgp_gpubuffer.js";
import { CgpContext } from "../cgp_state.js";
import { CgpShader } from "../cgp_shader.js";
import { BindGroup } from "./bindgroup.js";

/** @extends Binding */
export class BindingUniform extends Binding
{

    /** @type {Array<CgpUniform>} */
    #uniforms = [];

    /** @type {CgpGguBuffer} */
    cgpBuffer;

    /**
     * Description
     * @param {CgpContext} cgp
     * @param {string} name
     * @param {object} options
     */
    constructor(cgp, name, options)
    {
        super(cgp, name, options);
        console.log("bindinguniform", this.name);
    }

    /**
     * @param {CgpUniform} u
     */
    addUniform(u)
    {
        this.#uniforms.push(u);

    }

    /** @returns {GPUBindingResource} */
    getResource()
    {
        this.updateBuffer();
        return {
            "buffer": this.cgpBuffer.gpuBuffer,
            "minBindingSize": this.getSizeBytes(),
            "hasDynamicOffset": 0
        };
    }

    getSizeBytes()
    {
        let size = 0;
        for (let i = 0; i < this.#uniforms.length; i++)
            size += this.#uniforms[i].getSizeBytes();

        return size;
    }

    createBuffer()
    {
        let buffCfg = {
            "label": this.name,
            "size": this.getSizeBytes(),
            "usage": GPUBufferUsage.COPY_DST | GPUBufferUsage.UNIFORM
        };

        // if (this.bindingType == "read-write-storage") buffCfg.usage = GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC;
        // else if (this.bindingType == "read-only-storage" || this.bindingType == "storage") buffCfg.usage = GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST;
        // else if (this.bindingType == "uniform") buffCfg.;
        // else this._log.warn("unknown binding type", this.bindingType);

        // if (this.cGpuBuffers[inst]) this.cGpuBuffers[inst].dispose();

        // if (this.uniforms.length > 0 && this.uniforms[0].gpuBuffer) this.cGpuBuffers[inst] = this.uniforms[0].gpuBuffer;
        // else
        this.cgpBuffer = new CgpGguBuffer(this.cgp, this.name + " buff", null, { "buffCfg": buffCfg });

    }

    updateBuffer()
    {
        let info = { "name": this.#uniforms.length + " uniforms", "stage ": CgpShader.getStageString(this.stage), "uniforms": [] };

        const s = this.getSizeBytes() / 4;
        info.s = this.getSizeBytes();

        if (!this.cgpBuffer)
        {

            this.createBuffer();
            console.log("no cpubuff? ", this.stage, this.name);
            return;
        }
        this.cgpBuffer.setLength(s);

        let off = 0;
        for (let i = 0; i < this.#uniforms.length; i++)
        {

            this.#uniforms[i].copyToBuffer(this.cgpBuffer.floatArr, off);

            if (this.#uniforms[i].gpuBufferChanged)
            {
                console.log("un changed", this.cgpBuffer.floatArr);
            }

            info.uniforms.push(this.#uniforms[i].getInfo());

            off += this.#uniforms[i].getSizeBytes() / 4;
        }
        if (this.cgp.branchProfiler) this.cgp.branchProfiler.push("binding update buff", CgpShader.getStageString(this.stage), { "info": info });

        this.cgpBuffer.updateGpuBuffer();

        if (this.cgp.branchProfiler) this.cgp.branchProfiler.pop();

    }

    /**
     * @param {CgpShader} shader
     * @param {number} bindGroupNum
     */
    getShaderHeaderCode(shader, bindGroupNum)
    {
        let str = "";
        let typeStr = "";
        let name = this.name;

        if (!this.isActiveByDefine(shader))
        {
            str += "// " + typeStr + " " + this.name + ": excluded because define " + this.define + "\n";
            return str;
        }

        str += "// uniforms:" + this.#uniforms.length + "\n";

        if (this.#uniforms.length > 1)
        {
            typeStr = "strct_" + name;
            str += "// " + this.#uniforms.length + " uniforms\n";

            str += "struct " + typeStr + "\n";
            str += "{\n";
            for (let i = 0; i < this.#uniforms.length; i++)
            {

                str += "    " + this.#uniforms[i].name + ": " + this.#uniforms[i].getWgslTypeStr();
                if (i != this.#uniforms.length - 1)str += ",";
                str += "\n";
            }
            str += "};\n";

        }
        else
        {
            typeStr = this.#uniforms[0].getWgslTypeStr();
            name = this.#uniforms[0].name;
        }

        str += "@group(" + bindGroupNum + ") ";
        str += "@binding(" + this.bindNum + ") ";

        str += "var<uniform> ";
        str += name + ": " + typeStr + ";\n";

        return str + "\n";
    }

    /** @returns {GPUBindGroupLayoutEntry} */
    getLayoutEntry()
    {
        return {
            "visibility": this.stage,
            "binding": this.bindNum,
            "buffer": {}
        };
    }

    updateValues()
    {
        for (let i = 0; i < this.#uniforms.length; i++)
        {
            // if (this.#uniforms[i].needsUpdate)
        }
        return this.updateBuffer();

    }
}
