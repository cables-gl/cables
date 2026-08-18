new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "cellular2x2x2",
        "params": [
            { "type": "vec3", "port": op.inObject("seed") },
            { "type": "float", "port": op.inObject("scale"), "default": 4 }
        ],
        "result": { "type": "float", "port": op.outObject("result") },
        "src": attachments.random_wgsl
    });
