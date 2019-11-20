void main() {
    {{MODULE_BEGIN_FRAG}}
    vec4 col = vec4(1.);
    {{MODULE_COLOR}}

    outColor = vec4(0., 0., 1., 1.);
    // outColor = //vec4(gl_FragCoord.z, gl_FragCoord.z*gl_FragCoord.z, 0.,1.);
}