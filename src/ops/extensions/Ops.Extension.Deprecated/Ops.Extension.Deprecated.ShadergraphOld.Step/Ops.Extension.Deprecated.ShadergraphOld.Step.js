const
    invec = op.inObject("edge", null, "sg_genType"),
    invec2 = op.inObject("x", null, "sg_genType"),
    outvec = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOpCgl(this);
op.shaderFunc = "mod";

invec.onLinkChanged =
    invec.onChange = () =>
    {
        CGL.ShaderGraphOp.getMaxGenTypeFromPorts([invec, invec2], [invec, outvec]);

    };
