new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "shapeCircle",
        "params": [
            { "type": "vec2", "port": op.inObject("uv") },
            { "type": "float", "port": op.inObject("siz") },
            { "type": "float", "port": op.inObject("border") }
        ],
        "result": { "type": "float", "port": op.outObject("result") },
        "src": attachments.shape_circle_wgsl
    });
