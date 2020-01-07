// http://fabiensanglard.net/shadowmappingVSM/
IN vec4 vPos;
UNI float inShadowBias;
void main() {
    {{MODULE_BEGIN_FRAG}}
    vec4 col = vec4(1.);


    {{MODULE_COLOR}}


    float depth = gl_FragCoord.z;
    float dx = dFdx(depth); // for biasing depth-per-pixel
    float dy = dFdy(depth); // for biasing depth-per-pixel

    float moment2 = depth*depth + 0.25 * (dx * dx + dy * dy);

    float originalZ = gl_FragCoord.z; // / gl_FragCoord.w;
    outColor = vec4(originalZ,
    moment2, //moment2,
    originalZ*moment2,
    1.);
    // outColor = vec4(1., 1., 1., 1.);
    // outColor = //vec4(gl_FragCoord.z, gl_FragCoord.z*gl_FragCoord.z, 0.,1.);
}