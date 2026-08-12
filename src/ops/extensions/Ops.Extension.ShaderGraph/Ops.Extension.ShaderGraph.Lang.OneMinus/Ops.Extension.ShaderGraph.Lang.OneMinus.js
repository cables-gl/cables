new CABLES.ShaderGraphOp(this,
    {
        "type": "string",
        "name": "1.0-",
        "params": [
            { "type": "gen", "port": op.inObject("number", null, "sg_gen") }
        ],
        "result": { "type": "gen", "port": op.outObject("result", null, "sg_float") }

    });
