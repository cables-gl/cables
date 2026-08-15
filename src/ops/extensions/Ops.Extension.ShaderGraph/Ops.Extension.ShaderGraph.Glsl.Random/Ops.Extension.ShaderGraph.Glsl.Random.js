new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "rand",
        "params": [
            { "type": "float", "port": op.inObject("seed") }
        ],
        "result": { "type": "float", "port": op.outObject("result") },
        "src": "float rand(float seed) \n{\n  return (fract(sin(seed) * 43758.5453123)-0.5)*2.0;\n}"
    });
