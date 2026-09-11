new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "rand",
        "params": [
            { "type": "gen", "port": op.inObject("value") },
            { "type": "float", "port": op.inObject("min in") },
            { "type": "float", "port": op.inObject("max in") },
            { "type": "float", "port": op.inObject("min out") },
            { "type": "float", "port": op.inObject("max out") }
        ],
        "results": [{ "type": "gen", "port": op.outObject("result") }],
        "src": attachments.maprange_wgsl
    });
