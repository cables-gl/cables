const node = {
    "type": "function",
    "name": "sdfMenger",
    "params": [
        { "type": "float", "name": "scale", "value": 3 },
        { "type": "float", "name": "scale_factor", "value": 3 },
        { "type": "float", "name": "wrap", "value": 2 },
        { "type": "float", "name": "iterations", "value": 8 },
        { "type": "mat4", "name": "transform" },
        { "type": "vec4", "name": "color", "value": "1.,1.,1.,1." },
        { "type": "float", "name": "active", "value": 1 }
    ],
    "results": [{ "type": "SdfShape", "name": "sdf", "data": { "sdfMap": "sdfMengerMap" } }],
    "src": attachments.menger_glsl
};

new CABLES.ShaderGraphOp(op, node);
