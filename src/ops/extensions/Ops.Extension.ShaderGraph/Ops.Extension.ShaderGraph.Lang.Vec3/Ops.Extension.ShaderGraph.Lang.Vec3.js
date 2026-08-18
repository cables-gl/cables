new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "vec3",
        "params": [
            { "type": "float", "port": op.inObject("x") },
            { "type": "float", "port": op.inObject("y") },
            { "type": "float", "port": op.inObject("z") }
        ],
        "result": { "type": "vec3", "port": op.outObject("result") }

    });
