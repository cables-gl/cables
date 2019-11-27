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

    float moment2 = depth + 0.25 * (dx * dx + dy * dy);
    /*

    float depth = vPos.z/vPos.w;
    float moment1 = depth;
    float moment2 = depth*depth;

    moment2 += 0.25*(dx * dx + dy * dy);
    float variance = moment2 - (moment1 * moment1);
    variance = max(variance, inShadowBias);

    outColor = vec4(moment1, moment2, variance, 1.);
    */
    vec2 moments = vec2(gl_FragCoord.z, gl_FragCoord.z*gl_FragCoord.z);
    float variance = moments.y - (moments.x * moments.x);

    outColor = vec4(depth,
    moment2,
    1.,
    1.);
    // outColor = vec4(1., 1., 1., 1.);
    // outColor = //vec4(gl_FragCoord.z, gl_FragCoord.z*gl_FragCoord.z, 0.,1.);
}