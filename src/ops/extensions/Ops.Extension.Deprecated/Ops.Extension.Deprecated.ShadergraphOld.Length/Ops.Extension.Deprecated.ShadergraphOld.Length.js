const
    invec = op.inObject("input", null, "sg_genType"),
    outvec = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOpCgl(this);
op.shaderFunc = "length";

invec.onLinkChanged =
    invec.onChange = () =>
    {
        invec.copyLinkedUiAttrib("objType", invec);
    };
