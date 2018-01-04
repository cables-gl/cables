IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float offset;
UNI float frequency;
UNI float amplitude;
UNI float thick;

// #define M_PI2 1.5707963267948966
#define M_PI 3.1415926535897932384626433832795

{{BLENDCODE}}

void main()
{
    vec4 base=texture2D(tex,texCoord);

    float s=sin((texCoord.x*M_PI*frequency)+offset)*(amplitude*0.5);
    s+=texCoord.y;

    #ifndef FILL
        s+=(thick/2.0);
        s-=0.5;
        s*=2.0;
        s-=(thick/2.0);
        s+=texCoord.y;
        s=thick/s;
        s=smoothstep(0.99,1.0,s);
    #endif
    
    #ifdef FILL
        if(s>0.5) s=1.0;
            else s=0.0;
    #endif

    #ifdef FLIP
        s=1.0-s;
    #endif    

    vec4 col=vec4(s,s,s,1.0);
    col=vec4( _blend(base.rgb,col.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);

    gl_FragColor=col;
}
