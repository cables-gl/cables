import { Logger } from "cables-shared-client";
import Uniform from "./cgp_uniform.js";
import { preproc } from "../cg/preproc.js";
import { CgShader } from "../cg/cg_shader.js";

export default class Shader extends CgShader
{
    constructor(_cgp, _name)
    {
        super();
        if (!_cgp) throw new Error("shader constructed without cgp " + _name);
        this._log = new Logger("cgp_shader");
        this._cgp = _cgp;
        this._name = _name;
        this._uniforms = [];

        if (!_name) this._log.stack("no shader name given");
        this._name = _name || "unknown";
        this._compileReason = "";
        this.shaderModule = null;
        this._needsRecompile = true;

        this._src = "";
    }

    get isValid()
    {
        return this._isValid;
    }

    get uniforms()
    {
        return this._uniforms;
    }

    getName()
    {
        return this._name;
    }

    setWhyCompile(why)
    {
        this._compileReason = why;
    }

    setSource(src)
    {
        this._src = src;
        this.setWhyCompile("Source changed");
        this._needsRecompile = true;
    }

    compile()
    {
        this._isValid = true;
        this._cgp.pushErrorScope();

        const defs = {};
        for (let i = 0; i < this._defines.length; i++)
            defs[this._defines[i][0]] = this._defines[i][1] || true;

        const src = preproc(this._src, defs);

        this.shaderModule = this._cgp.device.createShaderModule({ "code": src });
        this._cgp.popErrorScope("cgp_shader " + this._name, this.error.bind(this));
        this._needsRecompile = false;
    }

    error(e)
    {
        this._isValid = false;
    }

    bind()
    {
        let sizes = {};
        for (let i = 0; i < this._uniforms.length; i++)
        {
            // console.log(this._uniforms[i]);
        }

        if (this._needsRecompile) this.compile();
    }

    /**
     * add a uniform to the fragment shader
     * @param {String} type ['f','t', etc]
     * @param {String} name
     * @param {any} valueOrPort value or port
     * @param p2
     * @param p3
     * @param p4
     * @memberof Shader
     * @instance
     * @function addUniformFrag
     * @returns {Uniform}
     */
    addUniformFrag(type, name, valueOrPort, p2, p3, p4)
    {
        const uni = new Uniform(this, type, name, valueOrPort, p2, p3, p4);
        uni.shaderType = "frag";
        return uni;
    }

    /**
     * add a uniform to the vertex shader
     * @param {String} type ['f','t', etc]
     * @param {String} name
     * @param {any} valueOrPort value or port
     * @param p2
     * @param p3
     * @param p4
     * @memberof Shader
     * @instance
     * @function addUniformVert
     * @returns {Uniform}
     */
    addUniformVert(type, name, valueOrPort, p2, p3, p4)
    {
        const uni = new Uniform(this, type, name, valueOrPort, p2, p3, p4);
        uni.shaderType = "vert";
        return uni;
    }

    /**
     * add a uniform to all shader programs
     * @param {String} type ['f','t', etc]
     * @param {String} name
     * @param {any} valueOrPort value or port
     * @param p2
     * @param p3
     * @param p4
     * @memberof Shader
     * @instance
     * @function addUniform
     * @returns {Uniform}
     */
    addUniform(type, name, valueOrPort, p2, p3, p4)
    {
        const uni = new Uniform(this, type, name, valueOrPort, p2, p3, p4);
        uni.shaderType = "both";
        return uni;
    }


    _addUniform(uni)
    {
        this._uniforms.push(uni);
        this.setWhyCompile("add uniform " + name);
        this._needsRecompile = true;
    }
}
