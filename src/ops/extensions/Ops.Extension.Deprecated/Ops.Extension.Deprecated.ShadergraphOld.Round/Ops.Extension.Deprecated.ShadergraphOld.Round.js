const
    invec = op.inObject("input", null, "sg_genType"),
    outvec = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOp(this);
op.shaderFunc = "round";

invec.onLinkChanged = () =>
{
    CGL.ShaderGraphOp.getMaxGenTypeFromPorts([invec], [invec, outvec]);

};
