IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float minR,maxR;
UNI float minG,maxG;
UNI float minB,maxB;


{{CGL.BLENDMODES}}

float myClamp(float v,float vMin,float vMax)
{
    #ifdef CLAMP
        return clamp(v,vMin,vMax);
    #endif

    #ifdef REMAP
        return mix(v*vMin,v*vMax,v);
    #endif

    #ifdef REMAP_SMOOTH
        return smoothstep(vMin,vMax,v);
    #endif
    return 0.0;
}


void main()
{
    vec3 color = texture(tex,texCoord).rgb;
    vec3 result = color;

    #ifdef CLAMP_R
        result.r=myClamp(color.r,minR,maxR);
    #endif

    #ifdef CLAMP_G
        result.g=myClamp(color.g,minG,maxG);
    #endif

    #ifdef CLAMP_B
        result.b=myClamp(color.b,minB,maxB);
    #endif

    outColor= mix(vec4(color,1.0),vec4(result,1.0),amount);
}