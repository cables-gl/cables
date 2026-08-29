// const valuex = op.inFloat("x", 0);
// const valuey = op.inFloat("y", 0);

new CABLES.ShaderGraphOp(this,
    {
        "type": "value",
        "name": "value",
        "values": [0, 0, 0, 1],
        "params": [
            { "type": "float", "name": "x" },
            { "type": "float", "name": "y" }
        ],
        "results": [{ "type": "vec2", "name": "result" }]
    });

const valuex = op.getPortByName("x");
const valuey = op.getPortByName("y");
op.init =
    valuey.onChange =
    valuex.onChange = () =>
    {
        op.shaderNode.values = [valuex.get(), valuey.get()];
        op.updateGraph();
    };
