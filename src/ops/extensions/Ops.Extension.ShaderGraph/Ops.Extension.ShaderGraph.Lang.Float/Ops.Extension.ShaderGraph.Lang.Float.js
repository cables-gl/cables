const value = op.inFloat("value", 0);

new CABLES.ShaderGraphOp(this,
    {
        "type": "value",
        "name": "value",
        "value": value.get(),
        "params": [
            { "type": "float", "port": value }
        ],
        "results": [{ "type": "float", "name": "result" }]
    });

op.init =
    value.onChange = () =>
    {
        op.shaderNode.value = value.get();
        op.updateGraph();
    };
