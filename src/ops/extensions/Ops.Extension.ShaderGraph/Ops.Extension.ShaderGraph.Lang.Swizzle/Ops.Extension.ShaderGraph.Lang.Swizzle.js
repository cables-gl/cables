const contents = ["X", "Y", "Z", "W"];

const inp = op.inObject("Input Vec"),
    resultType = op.inSwitch("Result Type", ["float", "vec2", "vec3", "vec4"], "vec4"),
    in1 = op.inSwitch("X", contents, "X"),
    in2 = op.inSwitch("Y", contents, "Y"),
    in3 = op.inSwitch("Z", contents, "Z"),
    in4 = op.inSwitch("W", contents, "W"),
    outp = op.outObject("Result Vec");

in1.onChange =
    in2.onChange =
    in3.onChange =
    in4.onChange =
    resultType.onChange =
    inp.onChange = () =>
    {

        if (inp.isLinked())
        {
            const inType = inp.links[0].getOtherPort(inp).op.shaderNode.results[0].type;
            console.log("innnn", inType);

            op.shaderNode.results[0].type = resultType.get();
            let num = 4;

            op.shaderNode.srcSwizzle = ".";

            op.shaderNode.srcSwizzle += in1.get();

            if (resultType.get() == "vec4" || resultType.get() == "vec3" || resultType.get() == "vec2")
                op.shaderNode.srcSwizzle += in2.get();

            if (resultType.get() == "vec4" || resultType.get() == "vec3")
                op.shaderNode.srcSwizzle += in3.get();

            if (resultType.get() == "vec4")
                op.shaderNode.srcSwizzle += in4.get();

            op.shaderNode.srcSwizzle = op.shaderNode.srcSwizzle.toLowerCase();

            op.updateGraph();

        }

    };

new CABLES.ShaderGraphOp(this,
    {
        "type": "swizzle",
        "name": "",
        "srcSwizzle": "",
        "params": [{ "type": "gen", "port": inp }],
        "result": { "type": "float" },
        "results": [{ "type": "vec4", "port": outp }]
    });
