new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "rand",
        "title": "name",
        "params": [
            { "type": "float", "port": op.inObject("seed") }
        ],
        "result": { "type": "float", "port": op.outObject("result") }
    });

const
    value = op.inString("var name", "texture"),
    code = op.inStringEditor("head src", "");

op.init =
    code.onChange =
    value.onChange =
    () =>
    {
        op.shaderNode.name = value.get();
        op.shaderNode.src = code.get();
        op.shaderNode.resultVarName = value.get();
        op.shaderNode.result.port.setRef({});
    };
