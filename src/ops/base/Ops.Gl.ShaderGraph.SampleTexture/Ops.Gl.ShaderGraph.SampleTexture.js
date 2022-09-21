const
    invec=op.inObject("tex",null,"sg_sampler2D"),
    invectc=op.inObject("texCoord",null,"sg_vec2"),
    outvec=op.outObject("color",null,"sg_vec4");


op.shaderFunc="texture";
new CGL.ShaderGraphOp(this);
