new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "rectangle",
        "params": [
            { "type": "u32", "port": op.inObject("vertex index") },
            // { "type": "VertexOutput", "port": op.inObject("vertex out") },
            { "type": "vec2", "port": op.inObject("size") },
            { "type": "bool", "port": op.inObject("mulmat") }
        ],
        "result": { "type": "vertexOutput", "port": op.outObject("result") },
        "src": attachments.rect_wgsl
    });
