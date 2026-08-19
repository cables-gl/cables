new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "shapeRectRound",
        "params": [
            { "type": "vec2", "port": op.inObject("uv") },
            { "type": "vec2", "port": op.inObject("siz") },
            { "type": "float", "port": op.inObject("round") }
        ],
        "result": { "type": "float", "port": op.outObject("result") },
        "src": attachments.shape_rect_wgsl
    });
