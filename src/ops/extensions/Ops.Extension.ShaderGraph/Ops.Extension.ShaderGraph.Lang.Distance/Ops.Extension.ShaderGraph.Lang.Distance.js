new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "distance",
        "params": [
            { "type": "gen", "port": op.inObject("a") },
            { "type": "gen", "port": op.inObject("b") }
        ],
        "result": { "type": "float", "port": op.outObject("result") }

    });
