IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float num;
UNI float width;
UNI float axis;
UNI float offset;
UNI float rotate;

UNI float r;
UNI float g;
UNI float b;
UNI float a;

{{BLENDCODE}}

#define PI 3.14159265
#define TAU (2.0*PI)

void pR(inout vec2 p, float a)
{
	p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}
void main()
{
    vec2 uv = texCoord-0.5;
    pR(uv.xy,rotate*TAU);
    vec4 stripe=vec4(0.0);

    float v=0.0;
    float c=1.0;
    v=uv.y;
    v+=offset;

    float m=mod(v,1.0/num);
    float rm=width*2.0*1.0/num/2.0;

    if(m>rm)
       stripe.rgb=mix(stripe.rgb,vec3( r,g,b ),a);

    #ifdef STRIPES_SMOOTHED
       m*=2.0;
       stripe.rgb= vec3(smoothstep(0.,1., abs(( ((m-rm) )/ (rm) )  ) ));
    #endif

    //blend section
    vec4 col=vec4(stripe.rgb,1.0);
    vec4 base=texture(tex,texCoord);

    col=vec4( _blend(base.rgb,col.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);
    outColor= col;
}
