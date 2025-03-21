import { CgpShader } from "../cgp_shader.js";

export class Binding
{
    name = "";
    bindNum = 0;
    stage = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE;
    define = "";

    getResource()
    {
        return null;
    }

    /** @returns {GPUBindGroupEntry} */
    getBindgroupEntry(options)
    {
        return {
            "binding": this.bindNum,
            "resource": this.getResource()

        };
    }

    /** @returns {GPUBindGroupLayoutEntry} */
    getLayoutEntry()
    {
        return {
            "visibility": this.stage,
            "binding": this.bindNum,

        };
    }

    /** @param {CgpShader} shader */
    isActiveByDefine(shader)
    {
        if (!this.define) return true;
        if (this.define && !shader.hasDefine(this.define)) return false;
        return true;
    }

}
