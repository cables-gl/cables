new CABLES.ShaderGraphOp(this,
    {
        "type": "component",
        "name": "split",
        "params": [{ "type": "vec3", "port": op.inObject("vec") }],
        "results": [
            { "type": "float", "port": op.outObject("x") },
            { "type": "float", "port": op.outObject("y") },
            { "type": "float", "port": op.outObject("z") }
        ]
    });
