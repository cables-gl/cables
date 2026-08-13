new CABLES.ShaderGraphOp(this,
    {
        "type": "string",
        "name": "1.0-",
        "params": [
            { "type": "gen", "port": op.inObject("number") }
        ],
        "result": { "type": "gen", "port": op.outObject("result") }

    });
