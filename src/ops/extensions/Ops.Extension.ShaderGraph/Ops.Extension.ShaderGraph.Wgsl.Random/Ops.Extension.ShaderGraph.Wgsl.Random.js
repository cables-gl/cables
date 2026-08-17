new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "rand",
        "params": [
            { "type": "float", "port": op.inObject("seed") }
        ],
        "result": { "type": "float", "port": op.outObject("result") },
        "src": attachments.random_wgsl
    });
