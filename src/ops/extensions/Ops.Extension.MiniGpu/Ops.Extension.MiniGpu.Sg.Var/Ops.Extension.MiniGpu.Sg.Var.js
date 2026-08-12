new CGL.ShaderGraphOp(this,
    {
        "type": "var",
        "name": "color",
        // "vartype": "vec4f",
        "params": [
            { "type": "vec4", "port": op.inObject("edge 0", null, "sg_gen") }
        ],
        "result": { "type": "vec4", "port": op.outObject("result", null, "sg_float") }

    });
