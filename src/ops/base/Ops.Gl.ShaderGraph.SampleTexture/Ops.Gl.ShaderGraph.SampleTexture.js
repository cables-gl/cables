const
    inTex = op.inObject("tex", null, "sg_sampler2D"),
    invectc = op.inObject("texCoord", null, "sg_vec2"),
    outvec = op.outObject("color", null, "sg_vec4");

let sgOp = null;
op.shaderSrc = "vec4 sampleTex_ID(sampler2D tex,vec2 texCoord){ return texture(tex,texCoord); }";
// updateSrc();

sgOp = new CGL.ShaderGraphOp(this, op.shaderSrc);

// inTex.onLinkChanged = updateSrc;

// function updateSrc()
// {
//     if (inTex.isLinked())
//     else
//         op.shaderSrc = "vec4 sampleTexPlaceholder(){ return vec4(1.0); }";

//     sgOp = new CGL.ShaderGraphOp(op, op.shaderSrc);
//     // if (sgOp)sgOp.updateGraph();
// }
