new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "shapeRect",
        "params": [
            { "type": "vec2", "name": "uv" },
            { "type": "vec2", "name": "siz" }
        ],
        "results": [{ "type": "float", "name": "result" }],
        "src": attachments.shape_rect_wgsl
    });
