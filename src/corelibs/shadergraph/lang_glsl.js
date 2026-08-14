import { Lang } from "./lang.js";

export class LangGlsl extends Lang
{

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
        if (typeFrom == "vec2" && typeTo == "vec4") return this.strTypeVec4 + "(" + paramStr + ", 0., 1.)";

        // if (typeFrom == "sg_float" && typeTo == "sg_vec2") return this.#lang.strTypeVec2 + "(" + paramStr + "," + paramStr + ")";
        // if (typeFrom == "sg_float" && typeTo == "sg_vec3") return this.#lang.strTypeVec3 + "(" + paramStr + "," + paramStr + "," + paramStr + ")";
        if (
            (typeFrom == "float" || typeFrom == "f32") && typeTo == "vec4") return this.strTypeVec4 + "(" + paramStr + "," + paramStr + "," + paramStr + ", 1.0)";

        log("conversionfail: " + paramStr + ": " + typeFrom + "->" + typeTo + "  ");
        return paramStr;
    }

}
