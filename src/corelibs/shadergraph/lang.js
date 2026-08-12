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
}
