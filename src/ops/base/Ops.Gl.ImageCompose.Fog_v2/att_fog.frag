IN vec2 texCoord;
UNI sampler2D image;
UNI sampler2D depthTex;

#ifdef HAS_GRADIENT
    UNI sampler2D fogColorTex;
#endif

UNI float amount;
UNI float farPlaneIn;
UNI float nearPlaneIn;

UNI float r;
UNI float g;
UNI float b;
UNI float a;
UNI float fogStart;
UNI float fogEnd;
UNI float density;
UNI bool invert;

const float LOG2 = 1.442695;

{{CGL.BLENDMODES}}

void main()
{
    vec4 base=texture(image,texCoord);
    vec4 dep=texture(depthTex,texCoord);

    float frustNear= nearPlaneIn ;
    float frustFar=farPlaneIn;

    float z=(2.0*frustNear)/(frustFar+frustNear-dep.r*(frustFar-frustNear));

    if(invert)
    {
        z=smoothstep(fogStart,fogEnd,1.0-pow(z,1.0-density));
    }
    else
    {
        z=smoothstep(fogStart,fogEnd,pow(z,1.0-density));
    }
    vec4 fog=vec4(r,g,b,a);

    #ifdef HAS_GRADIENT
        vec4 fogColTex = texture(fogColorTex,vec2(clamp(z,0.0,0.9999),0.5));
        fog *= fogColTex;
    #endif

    vec4 col;
    if(z>fogStart)
    {
        outColor=cgl_blend(base,mix(fog,base,1.0-z),amount);
    }
    else
        outColor=base;
}
