new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "pow",
        "params": [
            { "type": "gen", "port": op.inObject("number") },
            { "type": "gen", "port": op.inObject("number 2") }
        ],
        "result": { "type": "gen", "port": op.outObject("result") }

    });
