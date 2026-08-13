new CABLES.ShaderGraphOp(this,
    {
        "type": "operator",
        "name": " / ",
        "maxGen": true,
        "params": [
            { "type": "gen", "port": op.inObject("number 1") },
            { "type": "gen", "port": op.inObject("number 2") }
        ],
        "result": { "type": "gen", "port": op.outObject("result") }

    });
