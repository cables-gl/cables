new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "shapeRect",
        "params": [
            { "type": "vec2", "port": op.inObject("uv") },
            { "type": "vec2", "port": op.inObject("siz") }
        ],
        "result": { "type": "float", "port": op.outObject("result") },
        "src": attachments.shape_rect_wgsl
    });
