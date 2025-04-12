import { Logger } from "cables-shared-client";
import { CgpShader } from "../cgp_shader.js";
import { CgpContext } from "../cgp_state.js";
import { nl } from "../../cgl/constants.js";
import { simpleId } from "../../utils.js";

export class Binding
{
    id = simpleId();
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
     * @param {number} i
     */
    setBindNum(i)
    {
        if (this.bindNum != i) this.needsRebuildBindgroup = true;
        this.bindNum = i;
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
     * @param {CgpShader} _shader
     * @param {number} _bindGroupNum
     * @returns {String}
     */
    getShaderHeaderCode(_shader, _bindGroupNum)
    {
        return "//getShaderHeaderCode function not emplemented " + nl;
    }

    /**
     * @param {CgpShader} _shader
     * @returns {Binding}
     */
    copy(_shader)
    {
        // implenented in inheriting classes
        return null;
    }

    getInfo()
    {
        const o = { "name": this.name, "id": this.id, "class": this.constructor.name };
        return o;
    }
}
