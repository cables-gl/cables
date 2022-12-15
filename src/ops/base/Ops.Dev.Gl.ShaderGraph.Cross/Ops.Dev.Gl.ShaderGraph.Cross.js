const
    invec = op.inObject("value a", null, "sg_vec3"),
    invecb = op.inObject("value b", null, "sg_vec3"),
    outvec = op.outObject("result", null, "sg_vec3");

new CGL.ShaderGraphOp(this);
op.shaderFunc = "cross";
