const
    tex = op.inObject("texture");

new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "texture",
        "params": [
            { "type": "tex", "port": tex },
            { "type": "vec2", "port": op.inObject("coord") }
        ],
        "result": { "type": "vec4", "port": op.outObject("result") }

    });

tex.onChange = () =>
{
    op.updateGraph();
    // if (tex.links[0]) sampler.attribs.sg = tex.links[0].getOtherPort(tex).op.shaderNode.resultVarName + "_sampler";
    // else console.log("tex not linked");
};
