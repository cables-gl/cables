new CABLES.ShaderGraphOp(this,
    {
        "type": "component",
        "name": "split",
        "params": [{ "type": "vec3", "port": op.inObject("vec") }],
        "result": { "type": "float" },
        "results": [
            { "type": "float", "port": op.outObject("split x") },
            { "type": "float", "port": op.outObject("split y") },
            { "type": "float", "port": op.outObject("split z") }
        ]
    });
