new CABLES.ShaderGraphOp(this,
    {
        "type": "function",
        "name": "rand",
        "params": [
            { "type": "float", "name": "seed" }
        ],
        "results": [{ "type": "float", "name": "result" }],
        "src": "float rand(float seed) \n{\n  return (fract(sin(seed) * 43758.5453123)-0.5)*2.0;\n}\n"
    });
