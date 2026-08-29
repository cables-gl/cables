new CABLES.ShaderGraphOp(this,
    {
        "type": "var",
        "name": "color",
        "title": "name",
        "params": [
            { "type": "gen", "name": "value" }
        ],
        "results": [{ "type": "gen", "name": "result" }]
    });

const value = op.inString("var name", "color");

op.init =
    value.onChange =
    () =>
    {
        op.shaderNode.name = value.get();
        op.updateGraph();
    };
