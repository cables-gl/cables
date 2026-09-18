new CABLES.ShaderGraphOp(this,
    {
        "type": "setvar",
        "name": "hurz",
        "title": "name",
        "resultVarName": "hurz",
        "params": [
            { "type": "gen", "name": "color" }
        ],
        "results": [{ "type": "gen", "name": "result" }]
    });

op.init =
    () =>
    {
        op.tempData.shaderNode.updateGraph();
    };
