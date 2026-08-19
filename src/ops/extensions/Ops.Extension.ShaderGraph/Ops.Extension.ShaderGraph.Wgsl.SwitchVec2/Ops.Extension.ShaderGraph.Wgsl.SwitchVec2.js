new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "myswitchvec2",
        "params": [
            { "type": "float", "port": op.inObject("index") },
            { "type": "vec2", "port": op.inObject("v0") },
            { "type": "vec2", "port": op.inObject("v1") },
            { "type": "vec2", "port": op.inObject("v2") },
            { "type": "vec2", "port": op.inObject("v3") },
            { "type": "vec2", "port": op.inObject("v4") },
            { "type": "vec2", "port": op.inObject("v5") },
            { "type": "vec2", "port": op.inObject("v6") },
            { "type": "vec2", "port": op.inObject("v7") }
            // { "type": "float", "port": op.inObject("v8") },
        ],
        "result": { "type": "float", "port": op.outObject("result") },
        "src": attachments.switch_wgsl
    });
