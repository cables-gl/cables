IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float time;
UNI float variance;
UNI float mean;

#ifdef HAS_MULMASK
    UNI sampler2D texMul;
#endif

{{CGL.BLENDMODES3}}
{{MODULES_HEAD}}


vec3 channel_mix(vec3 a, vec3 b, vec3 w) {
    return vec3(mix(a.r, b.r, w.r), mix(a.g, b.g, w.g), mix(a.b, b.b, w.b));
}

float gaussian(float z, float u, float o) {
    return (1.0 / (o * sqrt(2.0 * 3.1415))) * exp(-(((z - u) * (z - u)) / (2.0 * (o * o))));
}

vec3 madd(vec3 a, vec3 b, float w) {
    return a + a * b * w;
}

vec3 screen(vec3 a, vec3 b, float w) {
    return mix(a, vec3(1.0) - (vec3(1.0) - a) * (vec3(1.0) - b), w);
}

vec3 overlay(vec3 a, vec3 b, float w) {
    return mix(a, channel_mix(
        2.0 * a * b,
        vec3(1.0) - 2.0 * (vec3(1.0) - a) * (vec3(1.0) - b),
        step(vec3(0.5), a)
    ), w);
}

vec3 soft_light(vec3 a, vec3 b, float w) {
    return mix(a, pow(a, pow(vec3(2.0), 2.0 * (vec3(0.5) - b))), w);
}

void main()
{
    vec4 rnd;
    vec2 uv = texCoord;

    float seed = dot(uv, vec2(12.9898, 78.233));
    float noise = fract(sin(seed) * 43758.5453 + time);
    float var2=variance*2.0;
    noise = gaussian(noise, mean, var2*var2);

    vec4 base=texture(tex,texCoord);
    vec4 col = vec4(vec3(noise),1.);// * (1.0 - base.rgb),1.);

    #ifdef NORMALIZE
        col.rgb=(col.rgb-0.5)*2.0;
    #endif

    #ifdef HAS_MULMASK
        col.rgb*=texture(texMul,texCoord).rgb;
    #endif

    outColor=cgl_blendPixel(base,col,amount);
}