const
    inputa = op.inObject("a", null, "sg_genType"),
    inputb = op.inObject("b", null, "sg_genType"),
    outvec = op.outObject("result", null, "sg_genType");

inputb.onLinkChanged =
inputa.onLinkChanged = () =>
{
    if (!inputa.isLinked()) return;

    const t = CGL.ShaderGraphOp.getMaxGenTypeFromPorts([inputb, inputa]);

    inputa.setUiAttribs({ "objType": t });
    outvec.setUiAttribs({ "objType": t });
    inputb.setUiAttribs({ "objType": t });
};

op.shaderCodeOperator = "+";
