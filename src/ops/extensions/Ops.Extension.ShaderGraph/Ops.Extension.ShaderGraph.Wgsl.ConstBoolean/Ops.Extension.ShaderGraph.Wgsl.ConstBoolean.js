const name = op.inString("name", "myOverride");
const value = op.inFloat("value", 0);

new CABLES.ShaderGraphOp(this,
    {
        "type": "override",
        // "name": "value",
        // "value": value.get(),
        "params": [
            { "type": "boolean", "port": value }
        ],
        "result": { "type": "boolean", "port": op.outObject("result") }
    });

op.init =
    name.onChange =
    value.onChange =
    () =>
    {
        op.shaderNode.value = value.get();
        op.shaderNode.src = "override " + name.get() + ":bool=" + value.get() + ";";
        op.shaderNode.resultVarName = name.get();

        op.shaderNode.result.port.setRef({});
    };
