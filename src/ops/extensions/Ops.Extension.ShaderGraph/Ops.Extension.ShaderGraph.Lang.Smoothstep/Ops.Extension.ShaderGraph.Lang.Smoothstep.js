new CABLES.ShaderGraphOp(this,
    {
        "type": "language",
        "name": "smoothstep",
        "params": [
            { "type": "float", "port": op.inObject("edge 0", null, "sg_float") },
            { "type": "float", "port": op.inObject("edge 1", null, "sg_float") },
            { "type": "float", "port": op.inObject("x", null, "sg_genType") }
        ],
        "return": { "type": "float", "port": op.outObject("result", null, "sg_float") }

    });
