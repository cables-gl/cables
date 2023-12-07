IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float stretchTopX;
UNI float stretchBotX;
UNI float stretchLeft;
UNI float stretchRight;

{{CGL.BLENDMODES3}}

void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);

    vec2 tc=texCoord;

    #ifdef SMOOTHSTEP
        tc.y=smoothstep(0.,1.,tc.y);
        tc.x=smoothstep(0.,1.,tc.x);
    #endif

    vec2 tcnorm=texCoord;

    tcnorm-=0.5;
    tcnorm*=2.0;

    tcnorm.x=mix(tcnorm.x*stretchBotX,tcnorm.x,tc.y);
    tcnorm.x=mix(tcnorm.x*stretchTopX,tcnorm.x,1.0-tc.y);

    tcnorm.y=mix(tcnorm.y*stretchLeft,tcnorm.y,tc.x);
    tcnorm.y=mix(tcnorm.y*stretchRight,tcnorm.y,1.0-tc.x);

    tc=tcnorm/2.0+0.5;

    col=texture(tex,tc);

    #ifdef CLAMP
        if(tc.x<0.0 || tc.x>1.0 || tc.y<0.0 || tc.y>1.0) col=vec4(0.0,0.0,0.0,0.0);
    #endif

    vec4 base=texture(tex,texCoord);
    base.a=0.0;

    outColor=cgl_blendPixel(base,col,amount);
}
