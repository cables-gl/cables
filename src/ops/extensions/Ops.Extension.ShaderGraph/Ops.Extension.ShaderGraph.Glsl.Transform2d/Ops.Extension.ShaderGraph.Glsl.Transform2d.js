new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "transform2d",
        "params": [
            { "type": "vec2", "name": "pos" },
            { "type": "vec2", "name": "translation" },
            { "type": "vec2", "name": "scale" },
            { "type": "float", "name": "rotate" }
        ],
        "results": [{ "type": "vec2", "name": "result" }],
        "src": attachments.trans2d_glsl
    });
