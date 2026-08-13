new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "round",
        "params": [
            { "type": "f32", "port": op.inObject("number") }
        ],
        "result": { "type": "f32", "port": op.outObject("result") }

    });
