new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "abs",
        "params": [
            { "type": "gen", "port": op.inObject("number") }
        ],
        "result": { "type": "gen", "port": op.outObject("result") }

    });
