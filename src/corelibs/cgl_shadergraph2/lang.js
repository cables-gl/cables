class Lang
{

    getDefaultParameter(type)
    {
        if (type == "sg_vec4") return this.strTypeVec4 + "(0., 0., 0., 0.)";
        if (type == "sg_vec3") return this.strTypeVec3 + "(0., 0., 0.)";
        if (type == "sg_vec2") return this.strTypeVec2 + "(0., 0.)";
        if (type == "sg_float") return "0.";
        if (type == "sg_genType") return "0.";
        return "/* no default: " + type + "*/";
    }
}

export class LangWgsl extends Lang
{
    strTypeVec4 = "vec4";
    strTypeVec3 = "vec3";
    strTypeVec2 = "vec2";
    strTypeFloat = "f32";

    typeConv(a)
    {

        return "var";

    }

    /**
     * @param {import("./shadergraphop").ShaderNode} node
     * @param {string} [name]
     */
    getVarDef(node, name)
    {
        name = name;
        if (name && !node.result?.type) return name + "=";
        let str = "let " + name + "=";
        // if (node.type == "function") str += "<" + node.result.type + ">";
        return str;
    }

    /**
     * @param {import("./shadergraphop").ShaderNode} node
     */
    getResultDef(node)
    {
        return this.getVarDef(node, node.resultVarName);
    }

    convertTypes(typeTo, typeFrom, paramStr)
    {
        if (typeFrom == typeTo) return paramStr;
        if (typeTo == "sg_genType") return paramStr;

        // if (typeFrom == "sg_texture" && typeTo == "sg_vec3") return paramStr + ".xyz";

        // if (typeFrom == "sg_vec4" && typeTo == "sg_vec3") return paramStr + ".xyz";
        // if (typeFrom == "sg_vec4" && typeTo == "sg_vec2") return paramStr + ".xy";
        // if (typeFrom == "sg_vec4" && typeTo == "sg_float") return paramStr + ".x";

        // if (typeFrom == "sg_vec3" && typeTo == "sg_vec2") return paramStr + ".xy";
        // if (typeFrom == "sg_vec3" && typeTo == "sg_float") return paramStr + ".x";

        // if (typeFrom == "sg_vec2" && typeTo == "sg_float") return paramStr + ".x";

        // if (typeFrom == "sg_vec3" && typeTo == "sg_vec4") return this.#lang.strTypeVec4 + "(" + paramStr + ", 0.)";

        // if (typeFrom == "sg_vec2" && typeTo == "sg_vec3") return this.#lang.strTypeVec3 + "(" + paramStr + ", 0.)";
        // if (typeFrom == "sg_vec2" && typeTo == "sg_vec4") return this.#lang.strTypeVec4 + "(" + paramStr + ", 0., 0.)";

        // if (typeFrom == "sg_float" && typeTo == "sg_vec2") return this.#lang.strTypeVec2 + "(" + paramStr + "," + paramStr + ")";
        // if (typeFrom == "sg_float" && typeTo == "sg_vec3") return this.#lang.strTypeVec3 + "(" + paramStr + "," + paramStr + "," + paramStr + ")";
        if (typeFrom == "f32" && typeTo == "vec4") return this.strTypeVec4 + "<f32>(" + paramStr + "," + paramStr + "," + paramStr + ", 1.0)";

        return "/* conversionfail: " + typeFrom + "->" + typeTo + " */";
    }

}
