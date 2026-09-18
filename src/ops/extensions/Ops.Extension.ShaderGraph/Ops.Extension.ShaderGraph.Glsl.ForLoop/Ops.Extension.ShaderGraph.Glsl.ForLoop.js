op.setScopeAreaBegin({ "op": "" });
new CABLES.ShaderGraphOp(this,
    {
        "type": "existingvar",
        "name": "color",
        "title": "name",
        "params": [
            { "name": "from", "type": "float" },
            { "name": "until", "type": "float", "value": 10 },
            { "name": "increment", "type": "float", "value": 1 }
        ],
        "results": [{ "type": "vec4", "name": "result" }]
    });

const
    value = op.inString("var name", "texture");

op.init =
    value.onChange =
    () =>
    {
        op.tempData.shaderNode.name = value.get();
        op.tempData.shaderNode.resultVarName = value.get();
        op.tempData.shaderNode.results[0].type = "float";
        op.tempData.shaderNode.updateGraph();
    };
