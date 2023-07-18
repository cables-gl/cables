IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float time;
UNI float thresh;

#ifdef HAS_MULMASK
    UNI sampler2D texMul;
#endif

{{CGL.BLENDMODES3}}
{{MODULES_HEAD}}

{{CGL.RANDOM_TEX}}

void main()
{
    vec4 rnd;

    #ifdef RGB
        rnd=vec4(cgl_random3(texCoord.xy+vec2(time)),1.0);
    #else
        float r=cgl_random(texCoord.xy+vec2(time));
        rnd=vec4( r,r,r,1.0 );
    #endif

    vec4 base=texture(tex,texCoord);
    vec4 col=rnd;//( _blend(base.rgb,rnd.rgb) ,1.0);

    #ifdef NORMALIZE
        col.rgb=(col.rgb-0.5)*2.0;
    #endif

    #ifdef HAS_MULMASK
        col.rgb*=texture(texMul,texCoord).rgb;
    #endif

    col*=step(thresh,cgl_random(texCoord.xy*11.0+vec2(time)));


    outColor=cgl_blendPixel(base,col,amount);
}