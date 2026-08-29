const
    tex = op.inObject("texture"),
    sampler = op.inObject("sampler");

new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "textureSample",
        "params": [
            { "type": "tex", "port": tex },
            { "type": "sampler", "port": sampler },
            { "type": "vec2", "name": "coord" }
        ],
        "result": { "type": "vec4", "port": op.outObject("result") }

    });

tex.onChange = () =>
{
    if (tex.links[0]) sampler.attribs.sg = tex.links[0].getOtherPort(tex).op.shaderNode.resultVarName + "_sampler";
    else console.log("tex not linked");
};
