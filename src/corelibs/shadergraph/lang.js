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
     * @param {Port[]} ports
     * @param {Port[]} portsSetType
     */
    getMaxGenTypeFromPorts(ports, portsSetType)
    {
        const types = ["float", "vec2", "vec3", "vec4"];
        let typeIdx = 0;

        for (let j = 0; j < ports.length; j++)
        {
            for (let i = 0; i < ports[j].links.length; i++)
            {
                const t = types.indexOf(ports[j].links[i].getOtherPort(ports[j]).op.shaderNode.result.type);
                typeIdx = Math.max(typeIdx, t);
            }
        }

        const t = types[typeIdx];

        if (portsSetType)
            for (let i = 0; i < portsSetType.length; i++)
                portsSetType[i].op.shaderNode.type = t;

        return t;
    }

}
