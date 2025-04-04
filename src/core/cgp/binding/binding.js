import { Logger } from "cables-shared-client";
import { CgpShader } from "../cgp_shader.js";
import { CgpContext } from "../cgp_state.js";

export class Binding
{
    name = "";
    bindNum = 0;
    stage = GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT;
    define = "";
    log = new Logger("binding");
    needsRebuildBindgroup = false;

    /** @type {CgpContext} */
    cgp = null;

    /**
     * Description
     * @param {CgpContext} cgp
     * @param {string} name
     * @param {object} options
     */
    constructor(cgp, name, options)
    {
        this.cgp = cgp;
        this.name = name;
        if (!name) this.log.error("no binding name given");
        this.options = options || {};
        if (options.hasOwnProperty("stage")) this.stage = options.stage;
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
     * @param {CgpShader} _shader
     */
    getLayoutEntry(_shader)
    {
        this.log.warn("unknown binding type?", this);
        return null;
    }

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

    /** @param {CgpShader} _shader */
    isActiveByDefine(_shader)
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
     * @returns {String}
     */
    getShaderHeaderCode(shader, bindGroupNum)
    {
        return "//getShaderHeaderCode function not emplemented ".endl();
    }

    /**
     * @param {CgpShader} _shader
     */
    copy(_shader)
    {
        // implenented in inheriting classes
    }
}
