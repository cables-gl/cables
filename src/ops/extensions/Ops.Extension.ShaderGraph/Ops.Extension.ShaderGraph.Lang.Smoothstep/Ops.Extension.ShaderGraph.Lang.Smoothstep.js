new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "smoothstep",
        "params": [
            { "type": "gen", "port": op.inObject("number") },
            { "type": "gen", "port": op.inObject("number 2") },
            { "type": "gen", "port": op.inObject("number 3") }
        ],
        "result": { "type": "gen", "port": op.outObject("result") }

    });
