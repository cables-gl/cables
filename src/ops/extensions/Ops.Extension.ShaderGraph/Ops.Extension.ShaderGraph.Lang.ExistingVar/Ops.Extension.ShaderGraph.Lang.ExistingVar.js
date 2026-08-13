new CABLES.ShaderGraphOp(this,
    {
        "type": "existingvar",
        "name": "color",
        "title": "name",
        "result": { "type": "vec4", "port": op.outObject("result") }
    });

const
    value = op.inString("var name", "texture");
// valueType = op.inString("var type", "texture2d");

op.init =
    // valueType.onChange =
    value.onChange =
    () =>
    {
        op.shaderNode.name = value.get();
        op.shaderNode.resultVarName = value.get();
        // op.shaderNode.result.type = valueType.get();
        op.shaderNode.result.port.setRef({});
    };
