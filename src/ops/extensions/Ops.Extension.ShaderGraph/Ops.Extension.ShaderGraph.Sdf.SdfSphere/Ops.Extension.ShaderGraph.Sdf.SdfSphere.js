const node = {
    "type": "function",
    "name": "sdfSphere",
    "params": [
        { "type": "float", "name": "radius", "value": 1 },
        { "type": "mat4", "name": "transform" },
        { "type": "vec4", "name": "color", "value": "1.,1.,1.,1." },
        { "type": "float", "name": "active", "value": 1 }
    ],
    "results": [{ "type": "SdfShape", "name": "sdf", "data": { "sdfMap": "sdfSphereMap" } }],
    "src": attachments.sphere_glsl
};

new CABLES.ShaderGraphOp(op, node);
