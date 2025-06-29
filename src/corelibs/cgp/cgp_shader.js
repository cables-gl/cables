import { Logger } from "cables-shared-client";
import { mat4 } from "gl-matrix";
import { now, Timer } from "cables";
import { CgpUniform } from "./cgp_uniform.js";
import { preproc } from "../cg/preproc.js";
import { CgShader } from "../cg/index.js";
import { CgpContext } from "./cgp_state.js";
import { BindGroup } from "./binding/bindgroup.js";
import { BindingUniform } from "./binding/binding_uniform.js";
import { BindingSampler } from "./binding/binding_sampler.js";
import { BindingTexture } from "./binding/binding_texture.js";
import { nl } from "../cgl/constants.js";

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
        this.worldUniforms = [];

        this.defaultBindGroup = new BindGroup(_cgp, this._name);
        this.modsBindGroup = new BindGroup(_cgp, this._name);

        /** @type {Array<BindGroup>} */
        this.bindGroups = [this.defaultBindGroup, this.modsBindGroup];

        if (!this.options.compute)
        {
            // this.bindingWorld = new BindingUniform(_cgp, "world", { "stage": GPUShaderStage.VERTEX });
            // this.defaultBindGroup.addBinding(this.bindingWorld);

            this.defaultUniBindingVert = new BindingUniform(_cgp, "uniVert", { "stage": GPUShaderStage.VERTEX });
            this.defaultBindGroup.addBinding(this.defaultUniBindingVert);

            this.defaultUniBindingFrag = new BindingUniform(_cgp, "uniFrag", { "stage": GPUShaderStage.FRAGMENT });
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
            this.worldUniforms.push(this.uniModelMatrix, this.uniViewMatrix, this.uniProjMatrix, this.uniNormalMatrix, this.uniModelViewMatrix);
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
     * @param {import("../cg/cg_shader.js").ShaderModule} mod
     * @param {string} src
     */
    _replaceModPrefixes(mod, src)
    {
        return src.replace(/MOD_/g, mod.prefix);
    }

    /**
     * @param {String} vs
     * @param {{}} defs
     */
    _replaceMods(vs, defs)
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
                    srcHeadVert += nl + nl + "//---- MOD: group:" + mod.group + ": idx:" + j + " - prfx:" + mod.prefix + " - " + mod.title + " ------" + nl;

                    srcVert += nl + nl + "//---- MOD: " + mod.title + " / " + mod.priority + " ------" + nl;

                    if (mod.attributes)
                        for (let k = 0; k < mod.attributes.length; k++)
                        {
                            const r = this._getAttrSrc(mod.attributes[k], false);
                            if (r.srcHeadVert)srcHeadVert += r.srcHeadVert;
                            if (r.srcVert)srcVert += r.srcVert;
                        }

                    srcHeadVert += mod.srcHead || "";
                    srcVert += mod.srcBody || "";

                    srcHeadVert += nl + "//---- end mod ------" + nl;

                    srcVert += nl + "//---- end mod ------" + nl;

                    srcVert = this._replaceModPrefixes(mod, srcVert);
                    srcHeadVert = this._replaceModPrefixes(mod, srcHeadVert);

                }
            }

            srcVert = preproc(srcVert, defs);
            vs = vs.replace("{{" + this._moduleNames[i] + "}}", srcVert);
        }

        srcHeadVert = preproc(srcHeadVert, defs);
        vs = vs.replace("{{MODULES_HEAD}}", srcHeadVert);
        return vs;
    }

    /**
     * @param {string} src
     */
    _replaceVertexOutputs(src = "")
    {
        const strVertOut = "{{VERTEX_OUTPUT";
        const posVertOut = src.indexOf(strVertOut);
        if (posVertOut > -1)
        {
            try
            {
                let str = src.substring(posVertOut + strVertOut.length, posVertOut + 100);
                let endPos = str.indexOf("}}");
                let startNum = parseInt(str.substring(0, endPos));

                for (let j = 0; j < this._modules.length; j++)
                {
                    if (!this._modules[j].outputs) continue;
                    let outs = this._modules[j].outputs;
                    let l = 0;
                    while (outs.indexOf("@location(" + l + ")") > -1)
                    {
                        outs = outs.replaceAll("@location(" + l + ")", "@location(" + (l + startNum) + ")");
                    }
                    outs = this._replaceModPrefixes(this._modules[j], outs);
                    src = src.replaceAll(strVertOut + " " + startNum + "}}", outs);
                }

            }
            catch (e)
            {
                console.log(e);
            }
        }
        return src;
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
            const src = this.bindGroups[i].getShaderHeaderCode(this, i);
            bindingsHeadFrag += src.fragment || "";
            bindingsHeadVert += src.vertex || "";
            bindingsHeadCompute += src.compute || "";
        }

        if (this.options.compute)
            src = bindingsHeadCompute + "\n\n////////////////\n\n" + src;
        else
            src = bindingsHeadFrag + "\n\n////////////////\n\n" + bindingsHeadVert + "\n\n////////////////\n\n" + src;

        src = this._replaceMods(src, defs);

        src = this._replaceVertexOutputs(src);

        const strVertOut = "{{VERTEX_OUTPUT";
        const posVertOut = src.indexOf(strVertOut);
        if (posVertOut > -1)
        {
            try
            {
                let str = src.substring(posVertOut + strVertOut.length, posVertOut + 100);
                let endPos = str.indexOf("}}");
                let startNum = parseInt(str.substring(0, endPos));
                let locCode = "@location(" + (startNum) + ") pos:vec4f, // generated";

                src = src.replaceAll(strVertOut + " " + startNum + "}}", locCode);
            }
            catch (e)
            {
                console.log(e);
            }
        }
        src = strDefs + "\n" + src;

        let srcHead = "//" + nl + "// ";
        if (this.options.compute)srcHead += "Compute ";
        else srcHead += "Render ";

        srcHead += "Shader: " + this._name + " - " + this.id + nl;
        srcHead += "//" + nl;

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

        this.lastCompile = now();
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
            this.bindGroups[i].bind(this.frameUsageCounter, passEnc, i);
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
        if (this.options.compute && stage == GPUShaderStage.COMPUTE) binding = this.defaultUniBindingCompute;
        return binding;
    }

    pipelineUpdated()
    {

        if (this.defaultUniBindingFrag) this.defaultUniBindingFrag.pipelineUpdated();
        if (this.defaultUniBindingVert) this.defaultUniBindingVert.pipelineUpdated();
        if (this.defaultUniBindingCompute) this.defaultUniBindingCompute.pipelineUpdated();
    }

    bindingsNeedPipeUpdate()
    {
        return (
            (this.defaultUniBindingFrag && this.defaultUniBindingFrag.needsPipeUpdate()) ||
            (this.defaultUniBindingVert && this.defaultUniBindingVert.needsPipeUpdate()) ||
            (this.defaultUniBindingCompute && this.defaultUniBindingCompute.needsPipeUpdate())
        );
    }

    /**
     * @param {String} name
     * @param {number} stage
     */
    hasUniformInStage(name, stage)
    {
        let binding = this.getDefaultUniBinding(stage);

        // console.log("bindingget uni", stage, binding, CgpShader.getStageString(stage));
        if (!binding) return false;
        return !!binding.getUniform(name);
    }

    /**
     * @param {String} name
     */
    hasUniform(name)
    {
        return this.hasUniformInStage(name, GPUShaderStage.FRAGMENT) || this.hasUniformInStage(name, GPUShaderStage.VERTEX) || this.hasUniformInStage(name, GPUShaderStage.COMPUTE);
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
        console.log("adduni2", this._name, u.name, this.id, binding, CgpShader.getStageString(stage));
        console.log("code", binding.getShaderHeaderCode(this, 0));

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
     * @returns newShader
     */
    copy()
    {
        this.bind();
        const shader = new CgpShader(this._cgp, this._name + " copy", this.options);
        console.log("copyyyyyy", this.id, shader.id);
        shader.setSource(this._src);

        shader._modules = JSON.parse(JSON.stringify(this._modules));
        shader._defines = JSON.parse(JSON.stringify(this._defines));

        shader._moduleNames = this._moduleNames;

        shader.bindGroups = [];
        for (let i = 0; i < this.bindGroups.length; i++)
        {
            const bg = this.bindGroups[i].copy(shader);
            shader.bindGroups.push(bg);

            if (this.bindGroups[i] == this.defaultBindGroup) shader.defaultBindGroup = bg;
            // if (this.bindGroups[i] == this.modsBindGroup) shader.modsBindGroup = bg;
            bg.setBindingNums();
        }

        shader.setWhyCompile("copy");
        shader.compile();
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
        const o = {
            "class": this.constructor.name,
            "id": this.id,
            "name": this._name,
            "needsPipelineUpdate": this.needsPipelineUpdate,
            "frameUsageCounter": this.lastFrameUsageCounter,
            "lastCompileReason": this.#lastCompileReason,
            "compileCount": this.compileCount,
            "defines": this._defines,
            "isCompute": this.options.compute,
            "modules": [],
            "bindgroups": []
        };

        for (let i = 0; i < this.bindGroups.length; i++)
        {
            o.bindgroups.push(this.bindGroups[i].getInfo());
        }

        for (let i = 0; i < this._modules.length; i++)
        {
            o.modules.push(this._modules[i].title + " " + this._modules[i].name + " " + this._modules[i].group);
            // console.log(this._modules[i]);
        }

        return o;
    }

    copyUniformValues(orig)
    {

    }
}
