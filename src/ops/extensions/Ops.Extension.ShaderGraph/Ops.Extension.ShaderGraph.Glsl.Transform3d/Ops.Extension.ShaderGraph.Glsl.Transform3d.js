new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "transform3d",
        "params": [
            { "type": "mat4", "name": "mat" },
            { "type": "vec3", "name": "translation" },
            { "type": "vec3", "name": "rotation" },
            { "type": "vec3", "name": "scale", "value": "1.,1.,1." }
        ],
        "results": [{ "type": "mat4", "name": "result" }],
        "src": attachments.trans3d_glsl
    });
