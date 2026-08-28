import { Port } from "cables";

export class Lang
{

    strTypeVec4 = "vec4";
    strTypeVec3 = "vec3";
    strTypeVec2 = "vec2";
    strTypeFloat = "float";

    convertTypes(log, typeTo, typeFrom, paramStr, node)
    {
        throw new Error("Method not implemented.");
        return "";
    }

    getResultDef(node)
    {
        throw new Error("Method not implemented.");
        return "";
    }

    getVarDef(node)
    {
        throw new Error("Method not implemented.");
        return "";
    }

    /**
     * @param {string} type
     * @param {string} value
     */
    getDefaultParameter(type, value)
    {
        if (type == "vec4")
        {
            const defaultValue = value || "0., 0., 0., 0.";
            return this.strTypeVec4 + "(" + defaultValue + ")";
        }
        if (type == "vec3")
        {

            const defaultValue = value || "0., 0.";
            return this.strTypeVec3 + "(" + defaultValue + ")";

        }
        if (type == "vec2")
        {

            const defaultValue = value || "0., 0.";
            return this.strTypeVec2 + "(" + defaultValue + ")";

        }
        if (type == "f32") return value || "0.";
        if (type == "float") return value || "0.";
        if (type == "gen") return value || "0.";
        if (type == "bool") return value || "false";
        if (type == "sampler") return value;

        return "/* no default: " + type + "*/";
    }

    /**
     * @param {number} f
     */
    floatStr(f)
    {
        let str = String(f);
        if (!str.includes(".")) str += ".";
        return str;
    }

    /**
     * @param {string} s
     */
    floatStrArr(s)
    {
        const arr = s.split(",");
        for (let i = 0; i < arr.length; i++)
        {
            if (!arr[i].includes(".")) arr[i] += ".";
        }
        return arr.join(",");
    }

    vecStr(arr)
    {
        let str = "vec" + arr.length + "(";
        for (let i = 0; i < arr.length; i++)
        {
            str += this.floatStr(arr[i]);
            if (i != arr.length - 1)str += ",";
        }
        str += ")";
        return str;
    }
}
