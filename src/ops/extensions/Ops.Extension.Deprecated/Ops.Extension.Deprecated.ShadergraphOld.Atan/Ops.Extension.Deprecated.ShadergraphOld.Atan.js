const
    invec = op.inObject("x", null, "sg_genType"),
    invec2 = op.inObject("y", null, "sg_genType"),
    outvec = op.outObject("result", null, "sg_genType");

new CGL.ShaderGraphOp(this);
op.shaderFunc = "atan";

invec.onLinkChanged =
    invec.onChange = () =>
    {
        CGL.ShaderGraphOp.getMaxGenTypeFromPorts([invec, invec2], [invec, outvec]);

    };
