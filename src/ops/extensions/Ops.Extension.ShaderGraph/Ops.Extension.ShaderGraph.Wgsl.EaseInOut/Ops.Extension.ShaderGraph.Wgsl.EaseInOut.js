new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "bumpcurve",
        "params": [
            { "type": "float", "port": op.inObject("seed") }
        ],
        "result": { "type": "float", "port": op.outObject("result") },
        "src": attachments.bump_wgsl
    });
