new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "hsb2rgb",
        "params": [
            { "type": "float", "name": "hue" },
            { "type": "float", "name": "saturation" },
            { "type": "float", "name": "value" }
        ],
        "results": [{ "type": "vec4", "name": "result" }],
        "src": attachments.hsv_glsl
    });
