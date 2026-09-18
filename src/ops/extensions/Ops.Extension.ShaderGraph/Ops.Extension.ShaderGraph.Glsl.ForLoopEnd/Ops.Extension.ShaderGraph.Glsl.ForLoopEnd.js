op.setScopeAreaEnd({ "op": "" });

new CABLES.ShaderGraphOp(this,
    {
        "type": "inline",
        "name": "loop",
        "params": [{ "type": "gen", "name": "loop" }],
        "results": [{ "type": "float", "name": "result" }]
    });

op.init =
    () =>
    {
        op.tempData.shaderNode.srcInline = "    for(float i=0.;i<10.;i+=1.)\n    {";
        op.tempData.shaderNode.srcInlineEnd = "    }";

        op.tempData.shaderNode.updateGraph();
    };
