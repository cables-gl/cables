new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "snoise3D",
        "params": [
            { "type": "vec3", "port": op.inObject("seed") }
        ],
        "result": { "type": "float", "port": op.outObject("result") },
        "src": attachments.noise_wgsl
    });
