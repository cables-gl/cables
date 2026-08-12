new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "length",
        "params": [
            { "type": "gen", "port": op.inObject("number", null, "sg_gen") }
        ],
        "result": { "type": "float", "port": op.outObject("result", null, "sg_gen") }

    });
