// http://fabiensanglard.net/shadowmappingVSM/
IN vec4 vPos;
UNI float inShadowBias;
void main() {
    {{MODULE_BEGIN_FRAG}}

    vec4 col = vec4(1.);

    {{MODULE_COLOR}}

    float depth = vPos.z/vPos.w;
    float moment1 = depth;
    float moment2 = depth*depth;

    float dx = dFdx(depth);
    float dy = dFdy(depth);
    moment2 += 0.25*(dx * dx + dy * dy);
    float variance = moment2 - (moment1 * moment1);
    variance = max(variance, inShadowBias);
    outColor = vec4(moment1, moment2, variance, 1.);
    // outColor = vec4(1., 1., 1., 1.);
    // outColor = //vec4(gl_FragCoord.z, gl_FragCoord.z*gl_FragCoord.z, 0.,1.);
}