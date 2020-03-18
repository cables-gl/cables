
UNI sampler2D tex;
IN vec2 texCoord;
UNI vec4 color;
UNI vec2 texSize;

#ifdef SHADOW
    UNI float shadowWidth;
#endif


float median(float r, float g, float b)
{
    return max(min(r, g), min(max(r, g), b));
}

void main()
{
    vec4 col=texture(tex,texCoord);

    #ifndef SDF
        outColor=col;
        return;
    #endif

    vec4 bgColor=vec4(0.0,0.0,0.0,0.0);
    vec4 fgColor=color;

    float pxRange=4.0;

    #ifdef SHADOW
        vec2 msdfUnit1 = texSize;
        vec3 smpl1 = texture(tex, vec2(texCoord.x-0.002,texCoord.y-0.002)).rgb;
        float sigDist1 = median(smpl1.r, smpl1.g, smpl1.b) - 0.001;
        float opacity1 = smoothstep(0.0,0.9,sigDist1*sigDist1);
        outColor = mix(bgColor, vec4(0.0,0.0,0.0,1.0), opacity1);
    #endif

    vec2 msdfUnit = pxRange/texSize;
    vec3 smpl = texture(tex, texCoord).rgb;
    float sigDist = median(smpl.r, smpl.g, smpl.b) - 0.5;
    sigDist *= dot(msdfUnit, 0.5/fwidth(texCoord));
    float opacity = clamp(sigDist + 0.5, 0.0, 1.0);

    outColor = mix(outColor, fgColor, opacity*color.a);
}