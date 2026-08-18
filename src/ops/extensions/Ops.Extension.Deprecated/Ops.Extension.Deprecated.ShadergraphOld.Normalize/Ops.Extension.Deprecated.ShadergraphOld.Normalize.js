const
    invec = op.inObject("input", null, "sg_float"),
    outvec = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOp(this);
op.shaderFunc = "normalize";

invec.onLinkChanged = () =>
{
    CGL.ShaderGraphOp.getMaxGenTypeFromPorts([invec], [invec, outvec]);
};
