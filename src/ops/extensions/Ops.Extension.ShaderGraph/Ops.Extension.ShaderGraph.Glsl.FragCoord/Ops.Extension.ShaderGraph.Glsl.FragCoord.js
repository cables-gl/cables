new CABLES.ShaderGraphOp(this,
    {
        "type": "string",
        "name": "gl_FragCoord.xy",
        "results": [{ "type": "vec2", "port": op.outObject("result") }]
    });
