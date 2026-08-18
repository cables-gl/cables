const
    inx = op.inObject("x", null, "sg_float"),
    iny = op.inObject("y", null, "sg_float"),
    ina = op.inObject("a", null, "sg_float"),
    result = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOp(this);
op.shaderFunc = "mix";

inx.onChange =
    iny.onChange =
    ina.onChange = () =>
    {
        CGL.ShaderGraphOp.getMaxGenTypeFromPorts([inx, iny], [inx, iny, result]);
    };
