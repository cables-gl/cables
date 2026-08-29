const valuex = op.inFloat("x", 0);
const valuey = op.inFloat("y", 0);

new CABLES.ShaderGraphOp(this,
    {
        "type": "value",
        "name": "value",
        "values": [0, 0, 0, 1],
        "params": [
            { "type": "float", "port": valuex },
            { "type": "float", "port": valuey }
        ],
        "result": { "type": "vec2", "port": op.outObject("result") }
    });

op.init =
    valuey.onChange =
    valuex.onChange = () =>
    {
        op.shaderNode.values = [valuex.get(), valuey.get()];
        op.updateGraph();
    };
