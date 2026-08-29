new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "shapeCross",
        "params": [
            { "type": "vec2", "name": "uv" },
            { "type": "float", "name": "w" },
            { "type": "float", "name": "r" }
        ],
        "results": [{ "type": "float", "name": "result" }],
        "src": attachments.shape_wgsl
    });
