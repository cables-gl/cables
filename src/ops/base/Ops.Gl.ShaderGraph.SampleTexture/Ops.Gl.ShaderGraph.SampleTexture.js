// const
//     inTex = op.inObject("tex", null, "sg_sampler2D"),
//     invectc = op.inObject("texCoord", null, "sg_vec2"),
//     outvec = op.outObject("color", null, "sg_vec4");

const src = "vec4 sampleTex(sampler2D tex,vec2 texCoord){ return texture(tex,texCoord); }";
// updateSrc();

const sgOp = new CGL.ShaderGraphOp(this, src);

console.log("SAMPLETEXTURE", sgOp.info);

// inTex.onLinkChanged = updateSrc;

// function updateSrc()
// {
//     if (inTex.isLinked())
//     else
//         op.shaderSrc = "vec4 sampleTexPlaceholder(){ return vec4(1.0); }";

//     sgOp = new CGL.ShaderGraphOp(op, op.shaderSrc);
//     // if (sgOp)sgOp.updateGraph();
// }
