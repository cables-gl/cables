import { Logger } from "cables-shared-client";
import { mat4 } from "gl-matrix";
import { CgpUniform } from "./cgp_uniform.js";
import { preproc } from "../cg/preproc.js";
import { CgShader } from "../cg/cg_shader.js";
import { CgpContext } from "./cgp_state.js";
import { BindGroup } from "./binding/bindgroup.js";
import { BindingUniform } from "./binding/binding_uniform.js";
import { BindingSampler } from "./binding/binding_sampler.js";
import { BindingTexture } from "./binding/binding_texture.js";
import { Binding } from "./binding/binding.js";

/** @typedef CgpShaderOptions
 * @property {Boolean} [compute]
 * @property {String} [entryPoint]
 */

export class CgpShader extends CgShader
{

    #lastCompileReason = "first";

    /** @type {CgpUniform} */
    uniModelMatrix;

    /** @type {CgpUniform} */
    uniViewMatrix;

    /** @type {CgpUniform} */
    uniProjMatrix;

    /**
     * @type {GPUCompilationInfo}
     */
    compilationInfo;

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
        this.options = options;
        this.options.compute = this.options.compute || false;

        if (!_name) this._log.stack("no shader name given");
        this._name = _name || "unknown";
        this.gpuShaderModule = null;
        this.frameUsageCounter = 0;
        this.lastFrameUsageCounter = -2;
        this.frameUsageFrame = -1;

        this._bindingIndexCount = 0;
        this.compileCount = 0;

        this.defaultBindGroup = new BindGroup(_cgp, this._name);

        /** @type {Array<BindGroup>} */
        this.bindGroups = [this.defaultBindGroup];

        if (!this.options.compute)
        {
            this.defaultUniBindingVert = new BindingUniform(_cgp, "uniVert", {});
            this.defaultBindGroup.addBinding(this.defaultUniBindingVert);

            this.defaultUniBindingFrag = new BindingUniform(_cgp, "uniFrag", {});
            this.defaultBindGroup.addBinding(this.defaultUniBindingFrag);
        }
        else
        {
            this.defaultUniBindingCompute = new BindingUniform(_cgp, "uniCompute", { "stage": GPUShaderStage.COMPUTE });
            this.defaultBindGroup.addBinding(this.defaultUniBindingCompute);
        }

        if (!this.options.compute)
        {
            this.uniModelMatrix = this.addUniform(new CgpUniform(this, "m4", "modelMatrix"), GPUShaderStage.VERTEX);
            this.uniViewMatrix = this.addUniform(new CgpUniform(this, "m4", "viewMatrix"), GPUShaderStage.VERTEX);
            this.uniProjMatrix = this.addUniform(new CgpUniform(this, "m4", "projMatrix"), GPUShaderStage.VERTEX);
            this.uniNormalMatrix = this.addUniform(new CgpUniform(this, "m4", "normalMatrix"), GPUShaderStage.VERTEX);
            this.uniModelViewMatrix = this.addUniform(new CgpUniform(this, "m4", "modelViewMatrix"), GPUShaderStage.VERTEX);
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

    reInit()
    {

    }

    /** @returns {boolean} */
    isValid()
    {
        return this._isValid;
    }

    getName()
    {
        return this._name;
    }

    incFrameUsageCount()
    {
        if (this.frameUsageFrame != this._cgp.frame)
        {
            this.lastFrameUsageCounter = this.frameUsageCounter;
            this.frameUsageCounter = 0;
        }
        else this.frameUsageCounter++;
        this.frameUsageFrame = this._cgp.frame;

        return this.frameUsageCounter;
    }

    getNewBindingGroupIndex()
    {
        return ++this._bindingIndexCount;
    }

    /**
     * @param {String} src
     */
    setSource(src)
    {
        this._src = src;
        this.setWhyCompile("Source changed");
    }

    /**
     * @param {String} vs
     */
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

    getDefines()
    {
        return this._defines;
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

        let bindingsHeadVert = "";
        let bindingsHeadFrag = "";
        let bindingsHeadCompute = "";

        for (let i = 0; i < this.bindGroups.length; i++)
        {
            const src = this.bindGroups[i].getShaderHeaderCode(this);
            bindingsHeadFrag += src.fragment || "";
            bindingsHeadVert += src.vertex || "";
            bindingsHeadCompute += src.compute || "";
        }

        if (this.options.compute)
            src = bindingsHeadCompute + "\n\n////////////////\n\n" + src;
        else
            src = bindingsHeadFrag + "\n\n////////////////\n\n" + bindingsHeadVert + "\n\n////////////////\n\n" + src;

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

        if (this._cgp.branchProfiler) this._cgp.branchProfiler.push("shadercompile", this._name, { "info": this.getInfo() });

        this._cgp.profileData.count("shader compile", this._name);
        this.gpuShaderModule = this._cgp.device.createShaderModule({ "code": this.getProcessedSource(), "label": this._name });

        this.gpuShaderModule.getCompilationInfo().then((compInfo) =>
        {
            this.compilationInfo = compInfo;
            if (compInfo.messages.length > 0)
            {
                let hasErrors = false;
                for (const msg of compInfo.messages)
                {
                    switch (msg.type)
                    {
                    case "error":
                        console.error("Shader " + msg.type + " at line " + msg.lineNum + ":" + msg.linePos + " :" + msg.message);
                        hasErrors = true;
                    case "warning":
                        console.warn("Shader " + msg.type + " at line " + msg.lineNum + ":" + msg.linePos + " :" + msg.message);
                        break;
                    case "info":
                        console.info("Shader " + msg.type + " at line " + msg.lineNum + ":" + msg.linePos + " :" + msg.message);
                        break;
                    }
                }
                if (hasErrors)
                {
                    console.log("has errrrrrrrrrr");
                    CABLES.UI.showShaderErrorCgp(this, compInfo, this.getProcessedSource());
                }

            }
        });

        this._cgp.popErrorScope(this.error.bind(this));

        this.#lastCompileReason = this._compileReason;

        // console.log("#lastCompileReason", this.#lastCompileReason);

        this.emitEvent("compiled", this._compileReason);
        this._needsRecompile = false;
        this._compileReason = "none";
        this.compileCount++;

        if (this._cgp.branchProfiler) this._cgp.branchProfiler.pop();
    }

    error(e)
    {
        this._isValid = false;
    }

    bind(passEnc = null)
    {

        this.incFrameUsageCount();
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

        for (let i = 0; i < this.bindGroups.length; i++)
        {
            this.bindGroups[i].updateValues(this.frameUsageCounter);

            this.bindGroups[i].bind(this.frameUsageCounter, passEnc);

        }
        if (this._needsRecompile) this.compile();
    }

    /**
     * @param {number} stage
     * @returns {BindingUniform}
     */
    getDefaultUniBinding(stage)
    {
        let binding = this.defaultUniBindingFrag;
        if (stage == GPUShaderStage.VERTEX) binding = this.defaultUniBindingVert;
        if (stage == GPUShaderStage.COMPUTE) binding = this.defaultUniBindingCompute;
        return binding;
    }

    /**
     * @param {CgpUniform} u
     * @param {number} stage
     * @returns {CgpUniform}
     */
    addUniform(u, stage)
    {
        const binding = this.getDefaultUniBinding(stage);
        if (u.type == "t") this.defaultBindGroup.addBinding(new BindingTexture(this._cgp, u.name, { "uniform": u }));
        else if (u.type == "sampler") this.defaultBindGroup.addBinding(new BindingSampler(this._cgp, u.name, { "uniform": u }));
        else
        {
            binding.addUniform(u);
        }

        this.needsPipelineUpdate = "add uniform";

        // if (!this.defaultBindGroup.hasBinding(binding)) this.defaultBindGroup.addBinding(binding);
        return u;
    }

    removeUniformByName(name)
    {
        const binding = this.getDefaultUniBinding(stage);
        binding.removeUniformByName(name);

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
        const shader = new CgpShader(this._cgp, this._name + " copy", this.options);
        shader.setSource(this._src);

        shader._modules = JSON.parse(JSON.stringify(this._modules));
        shader._defines = JSON.parse(JSON.stringify(this._defines));

        // shader._modGroupCount = this._modGroupCount;
        shader._moduleNames = this._moduleNames;

        // // shader.glPrimitive = this.glPrimitive;
        // // shader.offScreenPass = this.offScreenPass;
        // // shader._extensions = this._extensions;
        // // shader.wireframe = this.wireframe;
        // // shader._attributes = this._attributes;
        for (let i = 0; i < this.bindGroups.length; i++)
        {
            const bg = this.bindGroups[i].copy(shader);
            shader.bindGroups.push(bg);

            if (this.bindGroups[i] == this.defaultBindGroup)
                shader.defaultBindGroup = bg;
        }

        // for (let i = 0; i < this._uniforms.length; i++) this._uniforms[i].copy(shader);

        // // shader.bindingsFrag = [];
        // // for (let i = 0; i < this.bindingsFrag.length; i++) this.bindingsFrag[i].copy(shader);

        // // shader.bindingsVert = [];
        // // for (let i = 0; i < this.bindingsVert.length; i++) this.bindingsVert[i].copy(shader);
        // // shader.defaultUniBindingVert = this.bindingsVert[0];

        // // shader.bindingsCompute = [];
        // // for (let i = 0; i < this.bindingsCompute.length; i++) this.bindingsCompute[i].copy(shader);
        // // shader.defaultBindingComp = this.bindingsCompute[0];

        // console.log("copyyyyyyyyyy", shader.bindingsVert, this.bindingsVert);

        this.setWhyCompile("copy");
        return shader;
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
        if (stage == (GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX)) return "frag+vertex";
        if (stage == (GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE)) return "frag+vertex+comp";

        if (stage == GPUShaderStage.COMPUTE) return "compute";

        return "unknown" + stage;

    }

    getInfo()
    {
        return {
            "class": this.constructor.name,
            "name": this._name,
            "frameUsageCounter": this.lastFrameUsageCounter,
            "lastCompileReason": this.#lastCompileReason,
            "compileCount": this.compileCount,
            "numDefines": this._defines.length,
            "isCompute": this.options.compute
        };
    }

    copyUniformValues(orig)
    {

    }
}
