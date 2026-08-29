new CABLES.ShaderGraphOp(this,
    {
        "type": "component",
        "name": "split",
        "params": [{ "type": "vec2", "name": "vec" }],
        "result": { "type": "float" },
        "results": [
            { "type": "float", "name": "x" },
            { "type": "float", "name": "y" }]
    });
