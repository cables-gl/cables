new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "sin",
        "params": [
            { "type": "gen", "port": op.inObject("number", null, "sg_gen") }
        ],
        "result": { "type": "gen", "port": op.outObject("result", null, "sg_gen") }

    });
