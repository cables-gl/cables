const valuex = op.inFloat("x", 0);
const valuey = op.inFloat("y", 0);

new CABLES.ShaderGraphOp(this,
    {
        "type": "value",
        "name": "value",
        "values": [0, 0],
        "params": [
            { "type": "float", "port": valuex },
            { "type": "float", "port": valuey }
        ],
        "results": [{ "type": "vec2", "name": "result" }]
    });

op.init =
    valuey.onChange =
    valuex.onChange = () =>
    {
        op.shaderNode.values = [valuex.get(), valuey.get()];
        op.updateGraph();
    };
