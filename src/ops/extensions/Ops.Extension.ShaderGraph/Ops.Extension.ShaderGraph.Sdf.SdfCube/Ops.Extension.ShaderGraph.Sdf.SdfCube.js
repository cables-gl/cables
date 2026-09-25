const node = {
    "type": "function",
    "name": "sdfCube",
    "params": [
        { "type": "vec3", "name": "size", "value": "1.,1.,1." },
        { "type": "mat4", "name": "transform" },
        { "type": "vec4", "name": "color", "value": "1.,1.,1.,1." },
        { "type": "float", "name": "active", "value": 1 }
    ],
    "results": [{ "type": "SdfShape", "name": "sdf", "data": { "sdfMap": "sdfCubeMap" } }],
    "src": attachments.cube_glsl
};

new CABLES.ShaderGraphOp(op, node);
