new CABLES.ShaderGraphOp(this,
    {
        "type": "operator",
        "name": "*",
        "params": [
            { "type": "gen", "port": op.inObject("number 1") },
            { "type": "gen", "port": op.inObject("number 2") }
        ],
        "result": { "type": "vec4", "port": op.outObject("result") }

    });
