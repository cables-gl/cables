new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "mix",
        "params": [
            { "type": "gen", "port": op.inObject("value 0") },
            { "type": "float", "port": op.inObject("value 1") },
            { "type": "float", "port": op.inObject("fade") }
        ],
        "result": { "type": "gen", "port": op.outObject("result") }

    });
