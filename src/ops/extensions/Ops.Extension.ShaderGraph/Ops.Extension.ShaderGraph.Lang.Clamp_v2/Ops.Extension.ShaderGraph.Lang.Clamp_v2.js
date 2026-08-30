new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "clamp",
        "params": [
            { "type": "gen", "port": op.inObject("x") },
            { "type": "float", "port": op.inObject("minVal") },
            { "type": "float", "port": op.inObject("maxVal") }
        ],
        "result": { "type": "gen", "port": op.outObject("result") }

    });
