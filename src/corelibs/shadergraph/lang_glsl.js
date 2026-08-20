import { Lang } from "./lang.js";

export class LangGlsl extends Lang
{

    /* minimalcore:start */
    /**
     * @param {import("./shadergraphprogram.js").ShaderNode} node
     * @param {string} [name]
     */
    getVarDef(node, name)
    {
        if (name && !node.result?.type) return name + "=";

        if (node.result.type == "f32")node.result.type = "float";
        let str = node.result.type + " " + name + "=";
        // if (node.type == "function") str += "<" + node.result.type + ">";

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

    convertTypes(log, typeTo, typeFrom, paramStr)
    {
        if (typeFrom == typeTo) return paramStr;
        if (typeTo == "gen") return paramStr;

        // if (typeFrom == "texture" && typeTo == "vec3") return paramStr + ".xyz";

        if (typeFrom == "vec4" && typeTo == "vec3") return paramStr + ".xyz";
        if (typeFrom == "vec4" && typeTo == "vec2") return paramStr + ".xy";
        if (typeFrom == "vec4" && typeTo == "float") return paramStr + ".x";

        if (typeFrom == "vec3" && typeTo == "vec2") return paramStr + ".xy";
        if (typeFrom == "vec3" && typeTo == "float") return paramStr + ".x";
        if (typeFrom == "vec3" && typeTo == "vec4") return this.strTypeVec4 + "(" + paramStr + ", 0.)";

        if (typeFrom == "vec2" && typeTo == "float") return paramStr + ".x";
        if (typeFrom == "vec2" && typeTo == "vec3") return this.strTypeVec3 + "(" + paramStr + ", 0.)";
        if (typeFrom == "vec2" && typeTo == "vec4") return this.strTypeVec4 + "(" + paramStr + ", 0., 1.)";

        if (typeFrom == "float" && typeTo == "vec2") return this.strTypeVec2 + "(" + paramStr + "," + paramStr + ")";
        if (typeFrom == "float" && typeTo == "vec3") return this.strTypeVec3 + "(" + paramStr + "," + paramStr + "," + paramStr + ")";
        if ((typeFrom == "float" || typeFrom == "f32") && typeTo == "vec4") return this.strTypeVec4 + "(" + paramStr + "," + paramStr + "," + paramStr + ", 1.0)";

        log("conversionfail: " + paramStr + ": " + typeFrom + "->" + typeTo + "  ");
        return paramStr;
    }

/* minimalcore:end */
}
