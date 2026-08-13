new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "length",
        "params": [
            { "type": "gen", "port": op.inObject("number") }
        ],
        "result": { "type": "float", "port": op.outObject("result") }

    });
