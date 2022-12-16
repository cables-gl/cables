const
    invec = op.inObject("value a", null, "sg_genType"),
    invecb = op.inObject("value b", null, "sg_genType"),
    outvec = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOp(this);
op.shaderFunc = "dot";

invecb.onLinkChanged =
invec.onLinkChanged = () =>
{
    CGL.ShaderGraphOp.getMaxGenTypeFromPorts([invec, invecb], [invec, invecb]);
};
