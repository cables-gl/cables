import { Events } from "cables-shared-client";
import { ShaderGraphProgram } from "./cgl_shadergraphprogram.js";

const ShaderGraph = class extends Events
{
    constructor(op, portFrag, portVert)
    {
        super();
        this._op = op;
        this._portFrag = portFrag;
        this._portVert = portVert;

        this.progFrag = new ShaderGraphProgram(op, portFrag, "frag");
        this.progVert = new ShaderGraphProgram(op, portVert, "vert");

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
        console.log("update vertex", this._portVert.isLinked());

        if (this._portVert.isLinked()) this.progVert.compile();
        else
        {
            this.progVert.finalSrc = CGL.Shader.getDefaultVertexShader();
            this.emitEvent("compiled");
        }
    }

    getSrcFrag() { return this.progFrag.finalSrc; }

    getSrcVert() { return this.progVert.finalSrc || CGL.Shader.getDefaultVertexShader(); }
};

ShaderGraph.convertTypes = function (typeTo, typeFrom, paramStr)
{
    // console.log(typeFrom, " to ", typeTo);

    if (typeTo == "sg_genType") return paramStr;


    if (typeFrom == "sg_texture" && typeTo == "sg_vec3") return paramStr + ".xyz";

    if (typeFrom == "sg_vec4" && typeTo == "sg_vec3") return paramStr + ".xyz";
    if (typeFrom == "sg_vec4" && typeTo == "sg_vec2") return paramStr + ".xy";
    if (typeFrom == "sg_vec4" && typeTo == "sg_float") return paramStr + ".x";

    if (typeFrom == "sg_vec3" && typeTo == "sg_vec2") return paramStr + ".xy";
    if (typeFrom == "sg_vec3" && typeTo == "sg_float") return paramStr + ".x";

    if (typeFrom == "sg_vec2" && typeTo == "sg_float") return paramStr + ".x";

    if (typeFrom == "sg_vec3" && typeTo == "sg_vec4") return "vec4(" + paramStr + ", 0.)";

    if (typeFrom == "sg_vec2" && typeTo == "sg_vec3") return "vec3(" + paramStr + ", 0.)";
    if (typeFrom == "sg_vec2" && typeTo == "sg_vec4") return "vec4(" + paramStr + ", 0., 0.)";

    if (typeFrom == "sg_float" && typeTo == "sg_vec2") return "vec2(" + paramStr + "," + paramStr + ")";
    if (typeFrom == "sg_float" && typeTo == "sg_vec3") return "vec3(" + paramStr + "," + paramStr + "," + paramStr + ")";
    if (typeFrom == "sg_float" && typeTo == "sg_vec4") return "vec4(" + paramStr + "," + paramStr + "," + paramStr + ", 0.0)";

    return "/* conversionfail: " + typeFrom + "->" + typeTo + " */";
};

ShaderGraph.getDefaultParameter = function (t)
{
    if (t == "sg_vec4") return "vec4(0., 0., 0., 0.)";
    if (t == "sg_vec3") return "vec3(0., 0., 0.)";
    if (t == "sg_vec2") return "vec2(0., 0.)";
    if (t == "sg_float") return "0.";
    if (t == "sg_genType") return "0.";
    return "/* no default: " + t + "*/";
};

ShaderGraph.typeConv = function (sgtype)
{
    return sgtype.substr(3);
};


ShaderGraph.shaderIdCounter = ShaderGraph.shaderIdCounter || 1;
ShaderGraph.getNewId = () =>
{
    return ++ShaderGraph.shaderIdCounter;
};

export { ShaderGraph };
