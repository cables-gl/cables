const
    tex = op.inObject("texture");

new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "texture",
        "params": [
            { "type": "texture", "name": "texture", "port": tex },
            { "type": "vec2", "name": "coord" }
        ],
        "results": [{ "type": "vec4", "name": "result" }]

    });

tex.onChange = () =>
{
    op.updateGraph();
    // if (tex.links[0]) sampler.attribs.sg = tex.links[0].getOtherPort(tex).op.shaderNode.resultVarName + "_sampler";
    // else console.log("tex not linked");
};
