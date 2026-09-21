new CABLES.ShaderGraphOp(this,
    {
        "type": "var",
        "name": "color",
        "title": "name",
        "params": [
            { "type": "vec4", "name": "color" }
        ],
        "results": [{ "type": "vec4", "name": "result" }]
    });

op.init =
    () =>
    {
        op.tempData.shaderNode.updateGraph();
    };
