import { Binding } from "./binding.js";
import { CgpUniform } from "../cgp_uniform.js";
import { CgpGguBuffer } from "../cgp_gpubuffer.js";
import { CgpContext } from "../cgp_state.js";
import { CgpShader } from "../cgp_shader.js";
import { BindGroup } from "./bindgroup.js";

export class BindingUniform extends Binding
{

    /** @type {Array<CgpUniform>} */
    #uniforms = [];

    /** @type {CgpGguBuffer} */
    cgpBuffer;

    /** @type {CgpContext} */
    #cgp = null;

    /**
     * @param {CgpContext} cgp
     */
    constructor(cgp)
    {
        super();
        this.#cgp = cgp;
    }

    /**
     * @param {CgpUniform} u
     */
    addUniform(u)
    {
        this.#uniforms.push(u);
    }

    /** @returns {GPUBufferBinding} */
    getResource()
    {
        return null;
    }

    getSizeBytes()
    {
        let size = 0;
        for (let i = 0; i < this.#uniforms.length; i++)
            size += this.#uniforms[i].getSizeBytes();

        return size;
    }

    updateBuffer()
    {
        let info = { "name": this.#uniforms.length + " uniforms", "stage ": CgpShader.getStageString(this.stage), "inst": inst, "uniforms": [] };

        const s = this.getSizeBytes() / 4;

        if (!this.cgpBuffer)
        {
            console.log("no cpubuff? ", this.stage, this.name);
            return;
        }
        this.cgpBuffer.setLength(s);

        let off = 0;
        for (let i = 0; i < this.#uniforms.length; i++)
        {

            this.#uniforms[i].copyToBuffer(this.cgpBuffer.floatArr, off); // todo: check if uniform changed?

            if (this.#uniforms[i].gpuBufferChanged)
            {
                console.log("un changed", this.cgpBuffer.floatArr);
            }

            info.uniforms.push(this.#uniforms[i].getInfo());

            off += this.#uniforms[i].getSizeBytes() / 4;
        }
        if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.push("binding update buff", this.getStageString() + " " + this.bindingType, { "info": info });

        this.cgpBuffer.updateGpuBuffer();

        if (this.#cgp.branchProfiler) this.#cgp.branchProfiler.pop();

    }

    /**
     * @param {CgpShader} shader
     * @param {number} bindGroupNum
     */
    getShaderHeaderCode(shader, bindGroupNum)
    {
        let str = "";
        let name = this.name;
        let typeStr = "";

        if (!this.isActiveByDefine(shader))
        {
            str += "// " + typeStr + " " + this.name + ": excluded because define " + this.define + "\n";
            return str;
        }

        str += "// uniforms:" + this.#uniforms.length + "\n";

        if (this.#uniforms.length > 1)
        {
            typeStr = "strct_" + this.name;
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

}
