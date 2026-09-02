new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "pow",
        "maxGen": true,
        "params": [
            { "type": "gen", "port": op.inObject("number") },
            { "type": "gen", "port": op.inObject("number 2") }
        ],
        "results": [{ "type": "gen", "port": op.outObject("result") }]

    });
