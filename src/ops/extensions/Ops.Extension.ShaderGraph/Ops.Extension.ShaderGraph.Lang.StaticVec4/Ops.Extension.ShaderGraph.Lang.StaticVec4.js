const valuex = op.inFloat("x", 0);
const valuey = op.inFloat("y", 0);
const valuez = op.inFloat("z", 0);
const valuew = op.inFloat("w", 1);

new CABLES.ShaderGraphOp(this,
    {
        "type": "value",
        "name": "value",
        "values": [0, 0, 0, 1],
        "params": [
            { "type": "vec4", "port": valuex },
            { "type": "float", "port": valuey },
            { "type": "float", "port": valuez },
            { "type": "float", "port": valuew }
        ],
        "result": { "type": "vec4", "port": op.outObject("result") }
    });

op.init =
    valuey.onChange =
    valuez.onChange =
    valuew.onChange =
    valuex.onChange = () =>
    {
        op.shaderNode.values = [valuex.get(), valuey.get(), valuez.get(), valuew.get()];
        op.shaderNode.result.port.setRef({});
    };
