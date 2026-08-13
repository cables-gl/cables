new CABLES.ShaderGraphOp(this,
    {
        "type": "var",
        "name": "color",
        "params": [
            { "type": "vec4", "port": op.inObject("edge 0") }
        ],
        "result": { "type": "vec4", "port": op.outObject("result") }

    });
