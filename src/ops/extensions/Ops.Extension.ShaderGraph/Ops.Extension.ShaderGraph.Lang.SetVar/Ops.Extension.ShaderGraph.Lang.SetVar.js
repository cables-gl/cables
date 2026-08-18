new CABLES.ShaderGraphOp(this,
    {
        "type": "var",
        "name": "color",
        "title": "name",
        "params": [
            { "type": "gen", "port": op.inObject("value") }
        ],
        "result": { "type": "gen", "port": op.outObject("result") }
    });

const value = op.inString("var name", "color");

op.init =
    value.onChange =
    () =>
    {
        op.shaderNode.name = value.get();
        op.shaderNode.result.port.setRef({});
    };
