// precision highp float;
UNI sampler2D MOD_shadowMap;
IN vec4 MOD_positionFromLight;


// float unpackDepth(const in vec4 rgbaDepth)
// {
//     const vec4 bitShift = vec4(1.0, 1.0/512.0, 1.0/(512.0 * 512.0), 1.0/(512.0*512.0*512.0));
//     float depth = dot(rgbaDepth, bitShift);
//     return depth;
// }

