IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float time;

{{BLENDCODE}}
{{MODULES_HEAD}}
{{MOD_RANDOM}}

void main()
{
    vec4 rnd;

    #ifndef RGB
        float r=cgl_random(texCoord.xy+vec2(time));
        rnd=vec4( r,r,r,1.0 );
    #endif

    #ifdef RGB
        rnd=vec4(cgl_random3(texCoord.xy+vec2(time)),1.0);
    #endif


    vec4 base=texture(tex,texCoord);
    vec4 col=vec4( _blend(base.rgb,rnd.rgb) ,1.0);

    outColor=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);
}