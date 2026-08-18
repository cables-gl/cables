const
    invec = op.inObject("input", null, "sg_genType"),
    outvec = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOp(this);
op.shaderFunc = "ceil";

invec.onLinkChanged =
    invec.onChange = () =>
    {
        CGL.ShaderGraphOp.getMaxGenTypeFromPorts([invec], [invec, outvec]);

    };
