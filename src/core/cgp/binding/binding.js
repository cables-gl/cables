import { Logger } from "cables-shared-client";
import { CgpShader } from "../cgp_shader.js";
import { CgpContext } from "../cgp_state.js";

export class Binding
{
    name = "";
    bindNum = 0;
    stage = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE;
    define = "";
    log = new Logger("binding");

    /** @type {CgpContext} */
    cgp = null;

    /**
     * Description
     * @param {CgpContext} cgp
     * @param {string} name
     * @param {string} options
     */
    constructor(cgp, name, options)
    {
        this.cgp = cgp;
        this.name = name;
        if (!name) this.log.error("no binding name given");
        this.options = options || {};
    }

    getResource()
    {
        return null;
    }

    /** @returns {GPUBindGroupEntry} */
    getBindgroupEntry(options)
    {
        let label = "layout " + this.name + " [" + this.constructor.name;
        // for (let i = 0; i < this.uniforms.length; i++) label += this.uniforms[i].getName() + ",";
        label += "]";

        return {
            // "label": label,
            "binding": this.bindNum,
            "resource": this.getResource()
        };
    }

    /** @param {CgpShader} shader */
    isActiveByDefine(shader)
    {
        if (!this.define) return true;
        if (this.define && !shader.hasDefine(this.define)) return false;
        return true;
    }

    updateValues()
    {

    }

}
