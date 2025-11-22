import { Events } from "cables-shared-client";
import { ShaderGraphOp } from "./shadergraphop.js";
import { ShaderGraphProgram } from "./cgl_shadergraphprogram.js";
import { SgLangWebGpu } from "./sg_lang_webgpu.js";
import { SgLangWebGl } from "./sg_lang_webgl.js";

const ShaderGraph = class extends Events
{
    static LANG_GLSL = 0;
    static LANG_WGSL = 1;

    /** @type {Port} */
    #portVert = null;

    /** @type {Port} */
    #portFrag = null;

    /** @type {Op} */
    #op = null;

    #lang = null;

    constructor(op, lang, portFrag, portVert)
    {
        super();
        this.#op = op;
        this.#lang = lang;
        this.#portFrag = portFrag;
        this.#portVert = portVert;

        if (lang == ShaderGraph.LANG_GLSL) this.#lang = new SgLangWebGl();
        else this.#lang = new SgLangWebGpu();

        this.progFrag = new ShaderGraphProgram(this, op, portFrag, "frag");
        this.progVert = new ShaderGraphProgram(this, op, portVert, "vert");

        this.progFrag.on("compiled", () => { this.emitEvent("compiled"); });
        this.progVert.on("compiled", () => { this.emitEvent("compiled"); });

        portFrag.on("change", () =>
        {
            this.progFrag.compile();
        });
        portVert.on("change", this.updateVertex.bind(this));
        portVert.on("onLinkChanged", this.updateVertex.bind(this));
    }

    getUniforms()
    {
        const arr = [];

        for (let i = 0; i < this.progFrag.uniforms.length; i++) arr.push(this.progFrag.uniforms[i]);
        for (let i = 0; i < this.progVert.uniforms.length; i++) arr.push(this.progVert.uniforms[i]);
        return arr;
    }

    updateVertex()
    {
        console.log("update vertex", this.#portVert.isLinked());

        if (this.#portVert.isLinked()) this.progVert.compile();
        else
        {
            this.progVert.finalSrc = CGL.Shader.getDefaultVertexShader();
            this.emitEvent("compiled");
        }
    }

    getSrcFrag() { return this.progFrag.finalSrc; }

    getSrcVert() { return this.progVert.finalSrc || CGL.Shader.getDefaultVertexShader(); }
    convertTypes(typeTo, typeFrom, paramStr)
    {
        if (typeTo == "sg_genType") return paramStr;

        if (typeFrom == "sg_texture" && typeTo == "sg_vec3") return paramStr + ".xyz";

        if (typeFrom == "sg_vec4" && typeTo == "sg_vec3") return paramStr + ".xyz";
        if (typeFrom == "sg_vec4" && typeTo == "sg_vec2") return paramStr + ".xy";
        if (typeFrom == "sg_vec4" && typeTo == "sg_float") return paramStr + ".x";

        if (typeFrom == "sg_vec3" && typeTo == "sg_vec2") return paramStr + ".xy";
        if (typeFrom == "sg_vec3" && typeTo == "sg_float") return paramStr + ".x";

        if (typeFrom == "sg_vec2" && typeTo == "sg_float") return paramStr + ".x";

        if (typeFrom == "sg_vec3" && typeTo == "sg_vec4") return this.#lang.strTypeVec4 + "(" + paramStr + ", 0.)";

        if (typeFrom == "sg_vec2" && typeTo == "sg_vec3") return this.#lang.strTypeVec3 + "(" + paramStr + ", 0.)";
        if (typeFrom == "sg_vec2" && typeTo == "sg_vec4") return this.#lang.strTypeVec4 + "(" + paramStr + ", 0., 0.)";

        if (typeFrom == "sg_float" && typeTo == "sg_vec2") return this.#lang.strTypeVec2 + "(" + paramStr + "," + paramStr + ")";
        if (typeFrom == "sg_float" && typeTo == "sg_vec3") return this.#lang.strTypeVec3 + "(" + paramStr + "," + paramStr + "," + paramStr + ")";
        if (typeFrom == "sg_float" && typeTo == "sg_vec4") return this.#lang.strTypeVec4 + "(" + paramStr + "," + paramStr + "," + paramStr + ", 0.0)";

        return "/* conversionfail: " + typeFrom + "->" + typeTo + " */";
    }

    getDefaultParameter(t)
    {
        if (t == "sg_vec4") return this.#lang.strTypeVec4 + "(0., 0., 0., 0.)";
        if (t == "sg_vec3") return this.#lang.strTypeVec3 + "(0., 0., 0.)";
        if (t == "sg_vec2") return this.#lang.strTypeVec2 + "(0., 0.)";
        if (t == "sg_float") return "0.";
        if (t == "sg_genType") return "0.";
        return "/* no default: " + t + "*/";
    }

    typeConv(sgtype)
    {
        return sgtype.substr(3);
    }
};

ShaderGraph.shaderIdCounter = ShaderGraph.shaderIdCounter || 1;
ShaderGraph.getNewId = () =>
{
    return ++ShaderGraph.shaderIdCounter;
};

export { ShaderGraph };
