new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "abs",
        "params": [
            { "type": "gen", "port": op.inObject("number", null, "sg_float") }
        ],
        "result": { "type": "gen", "port": op.outObject("result", null, "sg_float") }

    });
