import { Lang } from "./lang.js";

export class LangWgsl extends Lang
{
    strTypeFloat = "f32";

    /**
     * @param {import("./shadergraphprogram.js").ShaderNode} node
     * @param {string} [name]
     */
    getVarDef(node, name)
    {
        if (node.type == "existingvar") return "";

        if (name && !node.result?.type) return name + "=";
        let str = "let " + name;

        str += "=";
        if (node.type == "value")
        {
            if (node.result.type == "float")
            {
                str += this.floatStr(node.value);
            }
        }
        return str;
    }

    /**
     * @param {import("./shadergraphprogram.js").ShaderNode} node
     */
    getResultDef(node)
    {
        return this.getVarDef(node, node.resultVarName);
    }

    /**
     * @param {string} typeTo
     * @param {string} typeFrom
     * @param {string} paramStr
     */
    convertTypes(log, typeTo, typeFrom, paramStr)
    {
        if (typeFrom == typeTo) return paramStr;
        if (typeTo == "gen") return paramStr;

        if (typeFrom == "vec2" && typeTo == "f32") return paramStr + ".x";

        // if (typeFrom == "texture" && typeTo == "vec3") return paramStr + ".xyz";

        // if (typeFrom == "vec4" && typeTo == "vec3") return paramStr + ".xyz";
        // if (typeFrom == "vec4" && typeTo == "vec2") return paramStr + ".xy";
        if (typeFrom == "vec4" && typeTo == "float") return paramStr + ".x";

        // if (typeFrom == "vec3" && typeTo == "vec2") return paramStr + ".xy";
        // if (typeFrom == "vec3" && typeTo == "float") return paramStr + ".x";

        if (typeFrom == "vec2" && typeTo == "float") return paramStr + ".x";

        // if (typeFrom == "vec3" && typeTo == "vec4") return this.strTypeVec4 + "(" + paramStr + ", 0.)";

        // if (typeFrom == "vec2" && typeTo == "vec3") return this.strTypeVec3 + "(" + paramStr + ", 0.)";
        if (typeFrom == "vec2" && typeTo == "vec4") return this.strTypeVec4 + "(" + paramStr + ".x," + paramStr + ".y, 0., 1.)";

        // if (typeFrom == "float" && typeTo == "vec2") return this.strTypeVec2 + "(" + paramStr + "," + paramStr + ")";
        // if (typeFrom == "float" && typeTo == "vec3") return this.strTypeVec3 + "(" + paramStr + "," + paramStr + "," + paramStr + ")";
        if ((typeFrom == "f32" || typeFrom == "float") && typeTo == "vec4") return this.strTypeVec4 + "<f32>(" + paramStr + "," + paramStr + "," + paramStr + ", 1.0)";
        log("conversionfail: " + paramStr + ": " + typeFrom + "->" + typeTo + "  ");

        return paramStr;
    }

}
