const
    invec = op.inObject("input", null, "sg_float"),
    inpow = op.inObject("power", null, "sg_float"),
    outvec = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOp(this);
op.shaderFunc = "pow";

inpow.onLinkChanged = () =>
{
    return invec.onLinkChanged = () =>
    {
        CGL.ShaderGraphOp.getMaxGenTypeFromPorts([invec, inpow], [invec, inpow, outvec]);
    };
};
