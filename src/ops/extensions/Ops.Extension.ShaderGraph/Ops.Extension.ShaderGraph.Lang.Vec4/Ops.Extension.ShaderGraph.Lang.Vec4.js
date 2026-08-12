new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "vec4",
        "params": [
            { "type": "float", "port": op.inObject("x", null, "sg_gen") },
            { "type": "float", "port": op.inObject("y", null, "sg_gen") },
            { "type": "float", "port": op.inObject("z", null, "sg_gen") },
            { "type": "float", "port": op.inObject("w", null, "sg_gen") }
        ],
        "result": { "type": "vec4", "port": op.outObject("result", null) }

    });
