#ifdef ALPHA_DITHERED
// from https://github.com/google/filament/blob/main/shaders/src/dithering.fs
// modified to use this to discard based on factor instead of dithering
float interleavedGradientNoise(highp vec2 n) {
    return fract(52.982919 * fract(dot(vec2(0.06711, 0.00584), n)));
}
float dither_InterleavedGradientNoise(float a) {
    // Jimenez 2014, "Next Generation Post-Processing in Call of Duty"
    highp vec2 uv = gl_FragCoord.xy;

    // The noise variable must be highp to workaround Adreno bug #1096.
    highp float noise = interleavedGradientNoise(uv);

    return step(noise, a);
}
#endif