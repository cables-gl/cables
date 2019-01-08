IN vec2 texCoord;
UNI sampler2D tex;
UNI float r;
UNI float g;
UNI float b;
UNI float amount;

#ifdef MASK
    UNI sampler2D mask;
#endif

{{BLENDCODE}}

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

    col=vec4( _blend(base.rgb,col.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*am),1.0);

    outColor= col;
}
