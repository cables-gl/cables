new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "step",
        "params": [
            { "type": "gen", "port": op.inObject("number", null, "sg_gen") },
            { "type": "gen", "port": op.inObject("number 2", null, "sg_gen") }
        ],
        "result": { "type": "gen", "port": op.outObject("result", null, "sg_gen") }

    });
