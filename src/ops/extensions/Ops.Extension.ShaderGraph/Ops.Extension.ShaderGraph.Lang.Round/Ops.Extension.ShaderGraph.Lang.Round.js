new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "round",
        "params": [
            { "type": "f32", "port": op.inObject("number", null, "sg_float") }
        ],
        "result": { "type": "f32", "port": op.outObject("result", null, "sg_float") }

    });
