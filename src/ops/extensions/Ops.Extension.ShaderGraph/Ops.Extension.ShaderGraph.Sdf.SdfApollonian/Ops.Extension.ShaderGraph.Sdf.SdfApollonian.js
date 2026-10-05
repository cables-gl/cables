const node = {
    "type": "function",
    "name": "sdfApollonian",
    "params": [
        { "type": "float", "name": "scale", "value": 1. },
        { "type": "vec3", "name": "wrap", "value": "2.,2.,2."},
        { "type": "mat4", "name": "transform" },
        { "type": "vec4", "name": "color", "value": "1.,1.,1.,1." },
        { "type": "float", "name": "active", "value": 1 }
    ],
    "results": [{ "type": "SdfShape", "name": "sdf", "data": { "sdfMap": "sdfApollonianMap" } }],
    "src": attachments.apollonian_glsl
};

new CABLES.ShaderGraphOp(op, node);
