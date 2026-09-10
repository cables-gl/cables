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

            op.shaderNode.results[0].type = resultType.get();
            op.shaderNode.srcSwizzle = ".";
            op.shaderNode.srcSwizzle += in1.get();

            const show2 = resultType.get() == "vec4" || resultType.get() == "vec3" || resultType.get() == "vec2";
            const show3 = resultType.get() == "vec4" || resultType.get() == "vec3";
            const show4 = resultType.get() == "vec4";

            if (show2) op.shaderNode.srcSwizzle += in2.get();
            if (show3) op.shaderNode.srcSwizzle += in3.get();
            if (show4) op.shaderNode.srcSwizzle += in4.get();

            in2.setUiAttribs({ "greyout": !show2 });
            in3.setUiAttribs({ "greyout": !show3 });
            in4.setUiAttribs({ "greyout": !show4 });

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
