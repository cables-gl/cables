const
    invecb = op.inObject("edge 0", null, "sg_float"),
    invecc = op.inObject("edge 1", null, "sg_float"),
    inveca = op.inObject("x", null, "sg_genType"),
    outvec = op.outObject("result", null, "sg_float");

new CGL.ShaderGraphOp(this);
op.shaderFunc = "smoothstep";

invecb.onLinkChanged =
    invecc.onLinkChanged =
    inveca.onLinkChanged =
    invecb.onChange =
    invecc.onChange =
    inveca.onChange = () =>
    {
        CGL.ShaderGraphOp.getMaxGenTypeFromPorts([inveca, invecc, invecb], [outvec]);
    };
