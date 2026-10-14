const node = {
    "type": "function",
    "name": "sdfKIFS1",
    "params": [
        { "type": "vec3", "name": "translate", "value": "2.13,-0.36,-1.17"},
        { "type": "vec2", "name": "rotate", "value": "2.81,1.68"},
        { "type": "float", "name": "scale", "value": 2 },
        { "type": "float", "name": "iterations", "value": 10 },
        { "type": "mat4", "name": "transform" },
        { "type": "vec4", "name": "color", "value": "1.,1.,1.,1." },
        { "type": "float", "name": "active", "value": 1 }
    ],
    "results": [{ "type": "SdfShape", "name": "sdf", "data": { "sdfMap": "sdfKIFS1Map" } }],
    "src": attachments.kifs1_glsl
};

new CABLES.ShaderGraphOp(op, node);
