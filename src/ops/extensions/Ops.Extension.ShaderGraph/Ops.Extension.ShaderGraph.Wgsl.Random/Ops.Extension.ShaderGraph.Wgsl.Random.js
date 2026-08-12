new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "rand",
        "params": [
            { "type": "float", "port": op.inObject("edge 0", null, "sg_float") }
        ],
        "result": { "type": "float", "port": op.outObject("result", null, "sg_float") },
        "src": "fn rand(seed: f32) -> f32 \n{\n  return (fract(sin(seed) * 43758.5453123)-0.5)*2.0;\n}"
    });
