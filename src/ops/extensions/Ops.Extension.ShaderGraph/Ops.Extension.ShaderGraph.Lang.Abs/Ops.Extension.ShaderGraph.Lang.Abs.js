new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "abs",
        "params": [
            { "type": "gen", "port": op.inObject("number") }
        ],
        "results": [{ "type": "gen", "port": op.outObject("result") }]

    });
