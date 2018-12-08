IN vec2 texCoord;
UNI sampler2D tex;
UNI float dirX;
UNI float dirY;
UNI float amount;

#ifdef HAS_MASK
    UNI sampler2D imageMask;
#endif

float random(vec3 scale, float seed)
{
    return fract(sin(dot(gl_FragCoord.xyz + seed, scale)) * 43758.5453 + seed);
}

void main()
{
    vec4 color = vec4(0.0);
    float total = 0.0;

    float am=amount;
    #ifdef HAS_MASK
        am=amount*texture(imageMask,texCoord).r;
        if(am<=0.02)
        {
            outColor=texture(tex, texCoord);
            return;
        }
    #endif

   vec2 delta=vec2(dirX*am*0.01,dirY*am*0.01);



    float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);


    #ifndef FASTBLUR
    const float range=20.0;
    #endif
    #ifdef FASTBLUR
    const float range=5.0;
    #endif

    for (float t = -range; t <= range; t++)
    {
        float percent = (t + offset - 0.5) / range;
        float weight = 1.0 - abs(percent);
        vec4 smpl = texture(tex, texCoord + delta * percent);

        smpl.rgb *= smpl.a;

        color += smpl * weight;
        total += weight;
    }

    outColor= color / total;

    outColor.rgb /= outColor.a + 0.00001;
}