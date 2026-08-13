new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "textureSample",
        "params": [
            { "type": "tex", "port": op.inObject("texture") },
            { "type": "sampler", "port": op.inObject("sampler") },
            { "type": "vec2", "port": op.inObject("coord") }
        ],
        "result": { "type": "vec4", "port": op.outObject("result") }

    });
// textureSample(tex,tex_sampler,fragCoord.xy/cables.resScreen);
