new CABLES.ShaderGraphOp(this,
    {
        "type": "operator",
        "name": "%",
        "maxGen": true,
        "params": [
            { "type": "gen", "resultType": true, "port": op.inObject("number 1") },
            { "type": "gen", "resultType": true, "port": op.inObject("number 2") }
        ],
        "result": { "type": "gen", "port": op.outObject("result") }

    });
