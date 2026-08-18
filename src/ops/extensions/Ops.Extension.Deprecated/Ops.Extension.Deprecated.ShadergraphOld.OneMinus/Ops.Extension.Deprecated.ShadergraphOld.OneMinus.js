const
    invec = op.inObject("input", null, "sg_float"),
    outvec = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOp(this);
op.shaderFunc = "1.0-";

// invec.onLinkChanged=
// invec.onChange = () =>
// {
//     invec.copyLinkedUiAttrib("objType", invec);
// };
