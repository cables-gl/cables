const
    inputa = op.inObject("a", null, "sg_float"),
    inputb = op.inObject("b", null, "sg_float"),
    outvec = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOp(this);
op.shaderCodeOperator = "+";

inputa.setUiAttribs({ "ignoreObjTypeErrors": true });
inputb.setUiAttribs({ "ignoreObjTypeErrors": true });

inputb.onLinkChanged =
inputa.onLinkChanged = () =>
{
    CGL.ShaderGraphOp.getMaxGenTypeFromPorts([inputb, inputa], [inputb, inputa, outvec]);
};
