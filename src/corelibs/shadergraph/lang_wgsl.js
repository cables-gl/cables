import { Lang } from "./lang.js";

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
        if (node.type == "value")
        {
            str += node.value;

            if (node.result.type == "float" && node.value % 1 == 0)str += ".";
        }
        //
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
        if (typeTo == "gen") return paramStr;

        if (typeFrom == "vec2" && typeTo == "f32") return paramStr + ".x";

        // if (typeFrom == "texture" && typeTo == "vec3") return paramStr + ".xyz";

        // if (typeFrom == "vec4" && typeTo == "vec3") return paramStr + ".xyz";
        // if (typeFrom == "vec4" && typeTo == "vec2") return paramStr + ".xy";
        // if (typeFrom == "vec4" && typeTo == "float") return paramStr + ".x";

        // if (typeFrom == "vec3" && typeTo == "vec2") return paramStr + ".xy";
        // if (typeFrom == "vec3" && typeTo == "float") return paramStr + ".x";

        // if (typeFrom == "vec2" && typeTo == "float") return paramStr + ".x";

        // if (typeFrom == "vec3" && typeTo == "vec4") return this.strTypeVec4 + "(" + paramStr + ", 0.)";

        // if (typeFrom == "vec2" && typeTo == "vec3") return this.strTypeVec3 + "(" + paramStr + ", 0.)";
        if (typeFrom == "vec2" && typeTo == "vec4") return this.strTypeVec4 + "(" + paramStr + ".x," + paramStr + ".y, 0., 1.)";

        // if (typeFrom == "float" && typeTo == "vec2") return this.strTypeVec2 + "(" + paramStr + "," + paramStr + ")";
        // if (typeFrom == "float" && typeTo == "vec3") return this.strTypeVec3 + "(" + paramStr + "," + paramStr + "," + paramStr + ")";
        if (
            (typeFrom == "f32" || typeFrom == "float") && typeTo == "vec4") return this.strTypeVec4 + "<f32>(" + paramStr + "," + paramStr + "," + paramStr + ", 1.0)";

        return "/* conversionfail: " + typeFrom + "->" + typeTo + " */";
    }

}
