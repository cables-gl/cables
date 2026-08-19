new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "myswitch",
        "params": [
            { "type": "float", "port": op.inObject("index") },
            { "type": "float", "port": op.inObject("v0") },
            { "type": "float", "port": op.inObject("v1") },
            { "type": "float", "port": op.inObject("v2") },
            { "type": "float", "port": op.inObject("v3") },
            { "type": "float", "port": op.inObject("v4") },
            { "type": "float", "port": op.inObject("v5") },
            { "type": "float", "port": op.inObject("v6") },
            { "type": "float", "port": op.inObject("v7") }
            // { "type": "float", "port": op.inObject("v8") },
        ],
        "result": { "type": "float", "port": op.outObject("result") },
        "src": attachments.switch_wgsl
    });
