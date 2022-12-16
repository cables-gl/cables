const
    invec = op.inObject("value a", null, "sg_float"),
    invecb = op.inObject("value b", null, "sg_float"),
    outvec = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOp(this);
op.shaderFunc = "max";

invecb.onLinkChanged =
invec.onLinkChanged = () =>
{
    CGL.ShaderGraphOp.getMaxGenTypeFromPorts([invec, invecb], [invec, invecb, outvec]);
};
