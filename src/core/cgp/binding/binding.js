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

    /**
     * @param {number} _inst
     */
    getResource(_inst)
    {
        // overwrite
        return null;
    }

    /**
     * @returns {GPUBindGroupLayoutEntry}
     */
    getLayoutEntry() { return null; }

    /**
     * @returns {GPUBindGroupEntry}
     * @param {number} inst
     */
    getBindgroupEntry(inst)
    {
        let label = "layout " + this.name + " [" + this.constructor.name;
        label += "]";

        return {
            "binding": this.bindNum,
            "resource": this.getResource(inst)
        };
    }

    /** @param {CgpShader} shader */
    isActiveByDefine(shader)
    {
        if (!this.define) return true;
        // if (this.define && !shader.hasDefine(this.define)) return false;
        return true;
    }

    /** @param {number} _inst */
    updateValues(_inst)
    {
        // overwrite
    }

    /**
     * @param {CgpShader} shader
     * @param {number} bindGroupNum
     */
    getShaderHeaderCode(shader, bindGroupNum)
    {
        return "//getShaderHeaderCode function not emplemented ".endl();
    }
}
