const
    invec = op.inObject("input", null, "sg_genType"),
    outvec = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOpCgl(this);
op.shaderFunc = "floor";

outvec.onLinkChanged =
    invec.onLinkChanged = () =>
    {
        CGL.ShaderGraphOp.getMaxGenTypeFromPorts([invec], [invec, outvec]);
    };
