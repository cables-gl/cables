new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "shapeCircle",
        "params": [
            { "type": "vec2", "name": "uv" },
            { "type": "float", "name": "siz" },
            { "type": "float", "name": "border" }
        ],
        "result": { "type": "float", "name": "result" },
        "src": attachments.shape_circle_wgsl
    });
