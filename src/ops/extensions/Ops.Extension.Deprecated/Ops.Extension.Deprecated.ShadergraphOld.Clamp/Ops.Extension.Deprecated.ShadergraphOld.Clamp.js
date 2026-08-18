const
    inx = op.inObject("x", null, "sg_genType"),
    iny = op.inObject("y", null, "sg_genType"),
    ina = op.inObject("a", null, "sg_genType"),
    result = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOp(this);
op.shaderFunc = "clamp";

inx.onChange =
    iny.onChange =
    ina.onChange =
    inx.onLinkChanged =
    iny.onLinkChanged =
    ina.onLinkChanged = () =>
    {
        CGL.ShaderGraphOp.getMaxGenTypeFromPorts([inx], [result]);
    };
