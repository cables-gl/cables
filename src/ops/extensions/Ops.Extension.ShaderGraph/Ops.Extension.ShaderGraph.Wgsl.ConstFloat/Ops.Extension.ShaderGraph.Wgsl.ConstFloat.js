const name = op.inString("name", "myOverride");
const value = op.inFloat("value", 0);

value.setUiAttribs({ "hidePort": true });

new CABLES.ShaderGraphOp(this,
    {
        "type": "override",
        "params": [
            { "type": "float", "port": value }
        ],
        "result": { "type": "float", "port": op.outObject("result") }
    });

op.init =
    name.onChange =
    value.onChange =
    () =>
    {
        op.shaderNode.value = value.get();
        op.shaderNode.src = "override " + name.get() + ":f32=" + value.get() + ";";
        op.shaderNode.resultVarName = name.get();

        op.updateGraph();
    };
