new CABLES.ShaderGraphOp(this,
    {
        "type": "operator",
        "name": " / ",
        "maxGen": true,
        "params": [
            { "type": "gen", "port": op.inObject("number 1", null, "sg_gen") },
            { "type": "gen", "port": op.inObject("number 2", null, "sg_gen") }
        ],
        "result": { "type": "gen", "port": op.outObject("result", null, "sg_gen") }

    });
