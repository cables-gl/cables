UNI sampler2D tex;
UNI float x;
UNI float y;
UNI float strength;
IN vec2 texCoord;

#ifdef HAS_MASK
    UNI sampler2D texMask;
#endif

float random(vec3 scale, float seed)
{
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

#ifdef MASK_SRC_LUM
    {{CGL.LUMINANCE}}
#endif

void main()
{
    float total = 0.0;
    vec4 color = vec4(0.0);
    vec2 center=vec2(x,y);
    center=(center/2.0)+0.5;

    vec2 texSize=vec2(1.0,1.0);
    vec2 toCenter = center - texCoord * texSize;

    /* randomize the lookup values to hide the fixed number of samples */
    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);
    float am = strength;

    #ifdef HAS_MASK

        float mul=1.0;
        #ifdef MASK_SRC_R
            mul=texture(texMask,texCoord).r;
        #endif
        #ifdef MASK_SRC_G
            mul=texture(texMask,texCoord).g;
        #endif
        #ifdef MASK_SRC_B
            mul=texture(texMask,texCoord).b;
        #endif
        #ifdef MASK_SRC_A
            mul=texture(texMask,texCoord).a;
        #endif
        #ifdef MASK_SRC_LUM
            mul=cgl_luminance(texture(texMask,texCoord).rgb);
        #endif

        #ifdef MASK_INV
            mul=1.0-mul;
        #endif

        am=am*mul;

        // if(am<=0.0)
        // {
        //     outColor=texture(tex, texCoord);
        //     return;
        // }
    #endif

    for (float t = 0.0; t <= NUM_SAMPLES; t++)
    {
        float percent = (t + offset) / NUM_SAMPLES;
        float weight = 4.0 * (percent - percent * percent);
        vec4 smpl = texture(tex, texCoord + toCenter * percent * am / texSize);

        smpl.rgb *= smpl.a;

        color += smpl * weight;
        total += weight;
    }

    outColor = color / total;
}