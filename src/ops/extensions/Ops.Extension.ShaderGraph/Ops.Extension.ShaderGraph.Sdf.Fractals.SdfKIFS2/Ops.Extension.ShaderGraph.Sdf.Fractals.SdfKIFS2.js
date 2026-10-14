const node = {
    "type": "function",
    "name": "sdfKIFS2",
    "params": [
        { "type": "vec3", "name": "translate", "value": "0.65,-1.01,-0.81"},
        { "type": "vec2", "name": "rotate", "value": "17.34,2.76"},
        { "type": "float", "name": "scale", "value": 2 },
        { "type": "float", "name": "iterations", "value": 10 },
        { "type": "mat4", "name": "transform" },
        { "type": "vec4", "name": "color", "value": "1.,1.,1.,1." },
        { "type": "float", "name": "active", "value": 1 }
    ],
    "results": [{ "type": "SdfShape", "name": "sdf", "data": { "sdfMap": "sdfKIFS2Map" } }],
    "src": attachments.kifs2_glsl
};

new CABLES.ShaderGraphOp(op, node);
