new CABLES.ShaderGraphOp(this,
    {
        "type": "string",
        "name": "gl_FragCoord.xy",
        "result": { "type": "vec2", "port": op.outObject("result", null, "sg_vec2") }

    });
