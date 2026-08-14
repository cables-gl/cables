new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "shapeCross",
        "params": [
            { "type": "vec2", "port": op.inObject("uv") },
            { "type": "float", "port": op.inObject("w") },
            { "type": "float", "port": op.inObject("r") }
        ],
        "result": { "type": "float", "port": op.outObject("result") },
        "src": attachments.shape_wgsl
    });
