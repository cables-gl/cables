export class Lang
{
    name = "unknown";

    strTypeVec4 = "vec4";
    strTypeVec3 = "vec3";
    strTypeVec2 = "vec2";
    strTypeFloat = "float";

    convertTypes(_log, _typeTo, _typeFrom, _paramStr, _node)
    {
        throw new Error("Method not implemented.");
    }

    getResultDef(_node)
    {
        throw new Error("Method not implemented.");
    }

    /**
     * @returns {string}
     */
    getVarDef(_node)
    {
        throw new Error("Method not implemented.");
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
            const defaultValue = value || "0., 0., 0.";
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
        if (type == "mat4") return "mat4(1.)";
        if (type == "mat3") return "mat4(1.)";
        if (type == "mat2") return "mat4(1.)";

        return "/* no default: " + type + "*/";
    }

    /**
     * @param {number|string} f
     */
    static floatStr(f)
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

    /**
     * @param {string[]} arr
     */
    vecStr(arr)
    {
        let str = "vec" + arr.length + "(";
        for (let i = 0; i < arr.length; i++)
        {
            str += Lang.floatStr(arr[i] || 0);
            if (i != arr.length - 1)str += ",";
        }
        str += ")";
        return str;
    }
}
