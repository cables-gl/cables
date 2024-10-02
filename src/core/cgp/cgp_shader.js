import { Logger } from "cables-shared-client";
import Uniform from "./cgp_uniform.js";
import { preproc } from "../cg/preproc.js";
import { CgShader } from "../cg/cg_shader.js";
import Binding from "./cgp_binding.js";

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

        this.defaultBindingVert = new Binding(_cgp, 0, "defaultVert", { "stage": "vert", "bindingType": "read-only-storage" });
        this.defaultBindingFrag = new Binding(_cgp, 1, "defaultFrag", { "stage": "frag", "bindingType": "read-only-storage" });
        this.bindingsFrag = [this.defaultBindingFrag];
        this.bindingsVert = [this.defaultBindingVert];

        this.uniModelMatrix = this.addUniformVert("m4", "modelMatrix");
        this.uniViewMatrix = this.addUniformVert("m4", "viewMatrix");
        this.uniProjMatrix = this.addUniformVert("m4", "projMatrix");
        this.uniNormalMatrix = this.addUniformVert("m4", "normalMatrix");
        this.uniModelViewMatrix = this.addUniformVert("m4", "modelViewMatrix");
        this._tempNormalMatrix = mat4.create();
        this._tempModelViewMatrix = mat4.create();


        this.bindingCounter = 0;
        this.bindCountlastFrame = -1;


        this._src = "";

        this._cgp.on("deviceChange", () =>
        {
            this.shaderModule = null;
            this._needsRecompile = "device changed";
        });
    }

    incBindingCounter()
    {
        if (this.bindCountlastFrame != this._cgp.frame) this.bindingCounter = 0;
        else this.bindingCounter++;
        this.bindCountlastFrame = this._cgp.frame;
    }

    reInit()
    {

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
        this._cgp.pushErrorScope("cgp_shader " + this._name);

        const defs = {};
        for (let i = 0; i < this._defines.length; i++)
            defs[this._defines[i][0]] = this._defines[i][1] || true;

        const src = preproc(this._src, defs);

        this.shaderModule = this._cgp.device.createShaderModule({ "code": src, "label": this._name });
        this._cgp.popErrorScope(this.error.bind(this));
        this._needsRecompile = false;
        // this.needsPipelineUpdate = "compiled";

        this.emitEvent("compiled");
    }

    error(e)
    {
        this._isValid = false;
    }

    bind()
    {
        // let sizes = {};
        // for (let i = 0; i < this._uniforms.length; i++)
        // {
        //     // console.log(this._uniforms[i]);
        // }

        this.uniModelMatrix.setValue(this._cgp.mMatrix);
        this.uniViewMatrix.setValue(this._cgp.vMatrix);
        this.uniProjMatrix.setValue(this._cgp.pMatrix);


        // mat4.invert(this._tempNormalMatrix, this._cgp.mMatrix);
        // mat4.transpose(this._tempNormalMatrix, this._tempNormalMatrix);

        mat4.transpose(this._tempNormalMatrix, this._cgp.mMatrix);
        mat4.invert(this._tempNormalMatrix, this._tempNormalMatrix);
        mat4.mul(this._tempModelViewMatrix, this._cgp.vMatrix, this._cgp.mMatrix);

        // cpu billboarding?
        // this._tempModelViewMatrix[0 * 4 + 0] = 1.0;
        // this._tempModelViewMatrix[0 * 4 + 1] = 0.0;
        // this._tempModelViewMatrix[0 * 4 + 2] = 0.0;

        // // #ifndef BILLBOARDING_CYLINDRIC
        // this._tempModelViewMatrix[1 * 4 + 0] = 0.0;
        // this._tempModelViewMatrix[1 * 4 + 1] = 1.0;
        // this._tempModelViewMatrix[1 * 4 + 2] = 0.0;
        // // #endif

        // this._tempModelViewMatrix[2 * 4 + 0] = 0.0;
        // this._tempModelViewMatrix[2 * 4 + 1] = 0.0;
        // this._tempModelViewMatrix[2 * 4 + 2] = 1.0;

        this.uniModelViewMatrix.setValue(this._tempModelViewMatrix);

        this.uniNormalMatrix.setValue(this._tempNormalMatrix);

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

        this.defaultBindingFrag.addUniform(uni);
        this.needsPipelineUpdate = "add frag uniform";

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

        this.defaultBindingVert.addUniform(uni);
        this.needsPipelineUpdate = "add ver uniform";

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

    getUniform(name)
    {
        for (let i = 0; i < this._uniforms.length; i++)
        {
            if (this._uniforms[i].getName() == name) return this._uniforms[i];
        }
    }
}
