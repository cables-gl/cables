new CABLES.ShaderGraphOp(this,
    {
        "type": "operator",
        "name": "*",
        "params": [
            { "type": "gen", "name": "number 1", "value": 1 },
            { "type": "gen", "name": "number 2", "value": 1 }
        ],
        "results": [{ "type": "gen", "port": op.outObject("result") }]

    });
