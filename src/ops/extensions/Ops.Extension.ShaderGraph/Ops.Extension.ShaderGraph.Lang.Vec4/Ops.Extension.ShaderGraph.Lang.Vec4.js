new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "vec4",
        "params": [
            { "type": "float", "port": op.inObject("x") },
            { "type": "float", "port": op.inObject("y") },
            { "type": "float", "port": op.inObject("z") },
            { "type": "float", "port": op.inObject("w") }
        ],
        "result": { "type": "vec4", "port": op.outObject("result") }

    });
