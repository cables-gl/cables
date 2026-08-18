new CABLES.ShaderGraphOp(this,
    {
        "type": "component",
        "name": "split",
        "params": [{ "type": "float", "port": op.inObject("vec") }],
        "result": { "type": "float" },
        "results": [
            { "type": "float", "port": op.outObject("split x") },
            { "type": "float", "port": op.outObject("split y") },
            { "type": "float", "port": op.outObject("split z") },
            { "type": "float", "port": op.outObject("split w") }]
    });

// const
//     value = op.inString("var name", "texture"),
//     valueType = op.inString("var type", "vec4");

// op.init =
//     valueType.onChange =
//     value.onChange =
//     () =>
//     {
//         op.shaderNode.name = value.get();
//         op.shaderNode.resultVarName = value.get();
//         op.shaderNode.result.type = valueType.get();
//         op.shaderNode.result.port.setRef({});
//     };
