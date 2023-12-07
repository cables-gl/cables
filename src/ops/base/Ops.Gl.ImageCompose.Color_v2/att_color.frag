IN vec2 texCoord;
UNI sampler2D tex;
UNI float r;
UNI float g;
UNI float b;
UNI float a;
UNI float amount;

#ifdef MASK
    UNI sampler2D mask;
#endif

{{CGL.BLENDMODES3}}

void main()
{
    vec4 col=vec4(r,g,b,a);
    vec4 base=texture(tex,texCoord);

    float am=amount;
    #ifdef MASK
        float msk=texture(mask,texCoord).r;
        #ifdef INVERTMASK
            msk=1.0-msk;
        #endif
        am*=1.0-msk;
    #endif

    outColor=cgl_blendPixel(base,col,am);
}
