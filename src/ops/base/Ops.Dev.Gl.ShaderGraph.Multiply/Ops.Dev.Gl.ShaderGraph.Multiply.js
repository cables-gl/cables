const
    inputa = op.inObject("a", null, "sg_genType"),
    inputb = op.inObject("b", null, "sg_genType"),
    outvec = op.outObject("result", null, "sg_genType");

inputa.setUiAttribs({ "ignoreObjTypeErrors": true });
inputb.setUiAttribs({ "ignoreObjTypeErrors": true });

new CGL.ShaderGraphOp(this);

inputb.onLinkChanged =
inputa.onLinkChanged = () =>
{
    const t = CGL.ShaderGraphOp.getMaxGenTypeFromPorts([inputb, inputa]);

    inputa.setUiAttribs({ "objType": t });
    outvec.setUiAttribs({ "objType": t });
    inputb.setUiAttribs({ "objType": t });
};

op.shaderCodeOperator = "*";
