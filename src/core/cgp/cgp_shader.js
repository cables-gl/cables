import { Logger } from "cables-shared-client";
import { CgpUniform } from "./cgp_uniform.js";
import { preproc } from "../cg/preproc.js";
import { CgShader } from "../cg/cg_shader.js";
import { Binding } from "./cgp_binding.js";
import { CgpContext } from "./cgp_state.js";

/** @typedef CgpShaderOptions
 * @property {Boolean} [compute]
 * @property {String} [entryPoint]
 */

export class CgpShader extends CgShader
{

    #computePipeline;

    /**
     * @param {CgpContext} _cgp
     * @param {String} _name
     * @param {CgpShaderOptions} options={}
     */
    constructor(_cgp, _name, options = {})
    {
        super();
        if (!_cgp) throw new Error("shader constructed without cgp " + _name);
        this._log = new Logger("cgp_shader");
        this._cgp = _cgp;
        this._name = _name;
        this._uniforms = [];
        this.options = options;
        this.options.compute = this.options.compute || false;

        if (!_name) this._log.stack("no shader name given");
        this._name = _name || "unknown";
        this._compileReason = "";
        this.gpuShaderModule = null;
        this._needsRecompile = true;
        this.bindingCounter = 0;
        this.bindCountlastFrame = -1;
        this._bindingIndexCount = 0;

        this.defaultBindingVert = new Binding(_cgp, "vsUniforms", { "stage": GPUShaderStage.VERTEX, "bindingType": "uniform", "index": this._bindingIndexCount++ });
        this.defaultBindingFrag = new Binding(_cgp, "fsUniforms", { "stage": GPUShaderStage.FRAGMENT, "bindingType": "uniform", "index": this._bindingIndexCount++ });
        this.defaultBindingCompute = new Binding(_cgp, "computeUniforms", { "stage": GPUShaderStage.COMPUTE, "bindingType": "uniform", "index": this._bindingIndexCount++ });

        /** @type {Array<Binding>} */
        this.bindingsFrag = [this.defaultBindingFrag];

        /** @type {Array<Binding>} */
        this.bindingsVert = [this.defaultBindingVert];

        /** @type {Array<Binding>} */
        this.bindingsCompute = [this.defaultBindingCompute];

        if (!this.options.compute)
        {
            this.uniModelMatrix = this.addUniformVert("m4", "modelMatrix");
            this.uniViewMatrix = this.addUniformVert("m4", "viewMatrix");
            this.uniProjMatrix = this.addUniformVert("m4", "projMatrix");
            this.uniNormalMatrix = this.addUniformVert("m4", "normalMatrix");
            this.uniModelViewMatrix = this.addUniformVert("m4", "modelViewMatrix");
            this._tempNormalMatrix = mat4.create();
            this._tempModelViewMatrix = mat4.create();
        }

        this._src = "";

        this._cgp.on("deviceChange", () =>
        {

            this.gpuShaderModule = null;
            this.setWhyCompile("device changed");

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
        this._needsRecompile = true;
    }

    getNewBindingIndex()
    {
        return ++this._bindingIndexCount;
    }

    setSource(src)
    {
        this._src = src;
        this.setWhyCompile("Source changed");
        this._needsRecompile = true;
    }

    _replaceMods(vs)
    {
        let srcHeadVert = "";
        for (let i = 0; i < this._moduleNames.length; i++)
        {
            let srcVert = "";

            for (let j = 0; j < this._modules.length; j++)
            {
                const mod = this._modules[j];
                if (mod.name == this._moduleNames[i])
                {
                    srcHeadVert += "\n//---- MOD: group:" + mod.group + ": idx:" + j + " - prfx:" + mod.prefix + " - " + mod.title + " ------\n";

                    srcVert += "\n\n//---- MOD: " + mod.title + " / " + mod.priority + " ------\n";

                    if (mod.attributes)
                        for (let k = 0; k < mod.attributes.length; k++)
                        {
                            const r = this._getAttrSrc(mod.attributes[k], false);
                            if (r.srcHeadVert)srcHeadVert += r.srcHeadVert;
                            if (r.srcVert)srcVert += r.srcVert;
                        }

                    srcHeadVert += mod.srcHead || "";
                    srcVert += mod.srcBody || "";

                    srcHeadVert += "\n//---- end mod ------\n";

                    srcVert += "\n//---- end mod ------\n";

                    srcVert = srcVert.replace(/{{mod}}/g, mod.prefix);
                    srcHeadVert = srcHeadVert.replace(/{{mod}}/g, mod.prefix);

                    srcVert = srcVert.replace(/MOD_/g, mod.prefix);
                    srcHeadVert = srcHeadVert.replace(/MOD_/g, mod.prefix);
                }
            }

            vs = vs.replace("{{" + this._moduleNames[i] + "}}", srcVert);
        }

        vs = vs.replace("{{MODULES_HEAD}}", srcHeadVert);
        return vs;
    }

    getProcessedSource()
    {
        const defs = {};
        for (let i = 0; i < this._defines.length; i++)
            defs[this._defines[i][0]] = this._defines[i][1] || true;

        let src = "";
        src += preproc(this._src, defs);

        let strDefs = "";
        for (let i = 0; i < this._defines.length; i++)
            strDefs += "// #define " + this._defines[i] + "\n";

        if (this.options.compute)
        {
            let bindingsHeadCompute = "";
            for (let i = 0; i < this.bindingsCompute.length; i++)
            {
                bindingsHeadCompute += "// bindingsCompute " + i + "\n";
                bindingsHeadCompute += this.bindingsCompute[i].getShaderHeaderCode();
            }

            src = bindingsHeadCompute + "\n\n//////////////// \n\n" + src;
        }
        else
        {

            let bindingsHeadVert = "";
            for (let i = 0; i < this.bindingsFrag.length; i++)
                bindingsHeadVert += this.bindingsFrag[i].getShaderHeaderCode();

            let bindingsHeadFrag = "";
            for (let i = 0; i < this.bindingsVert.length; i++)
                bindingsHeadFrag += this.bindingsVert[i].getShaderHeaderCode();

            src = bindingsHeadFrag + "\n\n////////////////\n\n" + bindingsHeadVert + "\n\n////////////////\n\n" + src;

        }

        src = this._replaceMods(src);

        src = strDefs + "\n" + src;

        let srcHead = "//".endl() + "// ";
        if (this.options.compute)srcHead += "Compute ";
        else srcHead += "Render ";

        srcHead += "Shader: " + this._name.endl();
        srcHead += "//".endl().endl();

        return srcHead + src;
    }

    compile()
    {
        this._isValid = true;
        this._cgp.pushErrorScope("cgp_shader " + this._name);

        console.log("compile", this._compileReason);

        this.gpuShaderModule = this._cgp.device.createShaderModule({ "code": this.getProcessedSource(), "label": this._name });
        this._cgp.popErrorScope(this.error.bind(this));
        this._needsRecompile = false;

        this.emitEvent("compiled");
    }

    error(e)
    {
        this._isValid = false;
    }

    bind()
    {
        if (!this.options.compute)
        {
            this.uniModelMatrix.setValue(this._cgp.mMatrix);
            this.uniViewMatrix.setValue(this._cgp.vMatrix);
            this.uniProjMatrix.setValue(this._cgp.pMatrix);

            // mat4.invert(this._tempNormalMatrix, this._cgp.mMatrix);
            // mat4.transpose(this._tempNormalMatrix, this._tempNormalMatrix);
            mat4.mul(this._tempModelViewMatrix, this._cgp.vMatrix, this._cgp.mMatrix);
            this.uniModelViewMatrix.setValue(this._tempModelViewMatrix);

            mat4.copy(this._tempNormalMatrix, this._cgp.mMatrix);
            mat4.invert(this._tempNormalMatrix, this._tempNormalMatrix);
            mat4.transpose(this._tempNormalMatrix, this._tempNormalMatrix);

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

            this.uniNormalMatrix.setValue(this._tempNormalMatrix);
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
     * @returns {CgpUniform}
     */
    addUniformFrag(type, name, valueOrPort, p2, p3, p4)
    {
        const uni = new CgpUniform(this, type, name, valueOrPort, p2, p3, p4);
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
     * @returns {CgpUniform}
     */
    addUniformVert(type, name, valueOrPort, p2, p3, p4)
    {
        const uni = new CgpUniform(this, type, name, valueOrPort, p2, p3, p4);
        uni.shaderType = "vert";

        this.defaultBindingVert.addUniform(uni);
        this.needsPipelineUpdate = "add vert uniform";

        return uni;
    }

    /**
     * @typedef UniformDescriptor
     * @property {String} name
     * @property {Number} shaderType GPUShaderStage.FRAGMENT
     * @property {String} type 4f,f, etc
     * @property {Array} values ports or numbers
    */

    /**
     * @param {UniformDescriptor} o
     */
    addUniformObject(o)
    {
        if (!o.type) this._log.warn("no uni type: ", o.type);
        if (!o.name) this._log.warn("no uni name: ", o.name);

        const uni = new CgpUniform(this, o.type, o.name, o.values[0]);

        if (o.shaderType == GPUShaderStage.COMPUTE)
        {
            this.defaultBindingCompute.addUniform(uni);
            uni.shaderType = "compute";
        }
        else if (o.shaderType == GPUShaderStage.VERTEX)
        {
            this.defaultBindingVert.addUniform(uni);
            uni.shaderType = "vert";
        }
        else if (o.shaderType == GPUShaderStage.FRAGMENT)
        {
            this.defaultBindingFrag.addUniform(uni);
            uni.shaderType = "frag";
        }
        else this._log.warn("unknown shaderType: ", o.shaderType);

        this.needsPipelineUpdate = "add " + o.shaderType + " uniform";
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

    /**
     * copy current shader
     * @function copy
     * @memberof Shader
     * @instance
     * @returns newShader
     */
    copy()
    {
        const shader = new Shader(this._cgp, this._name + " copy");
        shader.setSource(this._src);

        shader._modules = JSON.parse(JSON.stringify(this._modules));
        shader._defines = JSON.parse(JSON.stringify(this._defines));

        shader._modGroupCount = this._modGroupCount;
        shader._moduleNames = this._moduleNames;

        // shader.glPrimitive = this.glPrimitive;
        // shader.offScreenPass = this.offScreenPass;
        // shader._extensions = this._extensions;
        // shader.wireframe = this.wireframe;
        // shader._attributes = this._attributes;

        for (let i = 0; i < this._uniforms.length; i++) this._uniforms[i].copy(shader);

        shader.bindingsFrag = [];
        for (let i = 0; i < this.bindingsFrag.length; i++) this.bindingsFrag[i].copy(shader);
        shader.defaultBindingFrag = this.bindingsFrag[0];

        shader.bindingsVert = [];
        for (let i = 0; i < this.bindingsVert.length; i++) this.bindingsVert[i].copy(shader);
        shader.defaultBindingVert = this.bindingsVert[0];

        shader.bindingsComp = [];
        for (let i = 0; i < this.bindingsComp.length; i++) this.bindingsComp[i].copy(shader);
        shader.defaultBindingComp = this.bindingsComp[0];

        console.log("copyyyyyyyyyy", shader.bindingsVert, this.bindingsVert);

        this.setWhyCompile("copy");
        shader._needsRecompile = true;
        return shader;
    }

    /**
     * copy all uniform values from another shader
     * @function copyUniforms
     * @memberof Shader
     * @instance
     * @param origShader uniform values will be copied from this shader
     */
    copyUniformValues(origShader)
    {
        for (let i = 0; i < origShader._uniforms.length; i++)
        {
            if (!this._uniforms[i])
            {
                this._log.log("unknown uniform?!");
                continue;
            }
            this.getUniform(origShader._uniforms[i].getName()).set(origShader._uniforms[i].getValue());
        }

        // this.popTextures();
        // for (let i = 0; i < origShader._textureStackUni.length; i++)
        // {
        //     this._textureStackUni[i] = origShader._textureStackUni[i];
        //     this._textureStackTex[i] = origShader._textureStackTex[i];
        //     this._textureStackType[i] = origShader._textureStackType[i];
        //     this._textureStackTexCgl[i] = origShader._textureStackTexCgl[i];
        // }
    }

    dispose()
    {

    }

    /**
     * @param {number} stage
     */
    static getStageString(stage)
    {
        if (stage == GPUShaderStage.FRAGMENT) return "frag";
        if (stage == GPUShaderStage.VERTEX) return "vertex";
        if (stage == GPUShaderStage.COMPUTE) return "compute";

    }
}
