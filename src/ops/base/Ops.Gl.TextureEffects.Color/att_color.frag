IN vec2 texCoord;
UNI sampler2D tex;
UNI float r;
UNI float g;
UNI float b;
UNI float amount;

#ifdef MASK
    UNI sampler2D mask;
#endif

{{CGL.BLENDMODES}}

void main()
{
    vec4 col=vec4(r,g,b,1.0);
    vec4 base=texture(tex,texCoord);

    float am=amount;
    #ifdef MASK
        float msk=texture(mask,texCoord).r;
        #ifdef INVERTMASK
            msk=1.0-msk;
        #endif
        am*=1.0-msk;
    #endif

    outColor= cgl_blend(base,col,am);
    outColor.a*=base.a;

}
