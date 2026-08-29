const name = op.inString("name", "myOverride");
const value = op.inBool("value", 0);

new CABLES.ShaderGraphOp(this,
    {
        "type": "override",
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
        op.shaderNode.src = "override " + name.get() + ":bool=" + (value.get() ? "true" : "false") + ";";
        op.shaderNode.resultVarName = name.get();

        op.updateGraph();
    };
