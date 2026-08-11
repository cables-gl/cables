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
    strTypeVec4 = "vec4f";
    strTypeVec3 = "vec3f";
    strTypeVec2 = "vec2f";

    typeConv(a)
    {

        return "var";

    }
}
