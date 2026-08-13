import { Port } from "cables";

export class Lang
{

    getDefaultParameter(type)
    {
        if (type == "vec4") return this.strTypeVec4 + "(0., 0., 0., 0.)";
        if (type == "vec3") return this.strTypeVec3 + "(0., 0., 0.)";
        if (type == "vec2") return this.strTypeVec2 + "(0., 0.)";
        if (type == "f32") return "0.";
        if (type == "float") return "0.";
        if (type == "genType") return "0.";
        return "/* no default: " + type + "*/";
    }

    /**
     * @param {import("./shadergraphop").ShaderNodeParam[]} params
     * @param {Port} portsSetType
     */
    getMaxGenTypeFromParams(params, portsSetType)
    {
        params = params || [];
        const types = ["float", "vec2", "vec3", "vec4"];
        let typeIdx = 0;
        if (!portsSetType) return;

        for (let j = 0; j < params.length; j++)
        {
            for (let i = 0; i < params[j].port.links.length; i++)
            {
                const t = types.indexOf(params[j].port.links[i].getOtherPort(params[j].port).op.shaderNode.result.type);
                typeIdx = Math.max(typeIdx, t);
            }
        }

        const t = types[typeIdx];

        if (portsSetType)
        //     for (let i = 0; i < portsSetType.length; i++)
            portsSetType.op.shaderNode.result.type = t;

        return t;
    }

}
