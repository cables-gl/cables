new CABLES.ShaderGraphOp(this,
    {
        "type": "var",
        "name": "color",
        "title": "name",
        "params": [
            { "type": "vec4", "name": "color" }
        ],
        "results": [{ "type": "vec4", "name": "result" }]
    });

// const value = op.inString("var name", "color");

op.init =
    // value.onChange =
    () =>
    {
        // op.shaderNode.name = value.get();
        // op.shaderNode.results[0].port.setRef({});
        op.updateGraph();
    };
