new CABLES.ShaderGraphOp(this,
    {
        "type": "component",
        "name": "split",
        "params": [{ "type": "vec2", "port": op.inObject("vec") }],
        "result": { "type": "float" },
        "results": [
            { "type": "float", "port": op.outObject("split x") },
            { "type": "float", "port": op.outObject("split y") }]
    });
