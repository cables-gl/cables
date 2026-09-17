new CABLES.ShaderGraphOp(this,
    {
        "type": "existingvar",
        "name": "color",
        "title": "name",
        "results": [{ "type": "vec4", "name": "result" }]
    });

const
    value = op.inString("var name", "texture"),
    valueType = op.inString("var type", "vec4");

op.init =
    valueType.onChange =
    value.onChange =
    () =>
    {
        op.tempData.shaderNode.name = value.get();
        op.tempData.shaderNode.resultVarName = value.get();
        op.tempData.shaderNode.results[0].type = valueType.get();
        op.tempData.shaderNode.updateGraph();
    };
