new CABLES.ShaderGraphOp(this,
    {
        "type": "constructor",
        "name": "vec2",
        "convert": false,
        "params": [
            { "type": "float", "port": op.inObject("x") },
            { "type": "float", "port": op.inObject("y") }
        ],
        "result": { "type": "vec2", "port": op.outObject("result") }

    });
