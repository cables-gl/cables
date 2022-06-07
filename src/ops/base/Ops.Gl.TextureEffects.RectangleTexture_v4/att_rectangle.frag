IN vec2 texCoord;
UNI sampler2D tex;

UNI float width;
UNI float height;
UNI float x;
UNI float y;

UNI float r;
UNI float g;
UNI float b;
UNI float a;

UNI float aspect;
UNI float amount;
UNI float rotate;
UNI float roundness;

#define DEG2RAD 0.785398163397

{{CGL.BLENDMODES3}}

mat2 rot(float angle)
{
    float s=sin(angle);
    float c=cos(angle);

    return mat2(c,-s,s,c);
}

void main()
{
    vec4 base=texture(tex,texCoord);
    vec4 col=vec4(r,g,b,a);
    vec2 p=texCoord;

    // p.y*=aspect;
    float d=1.0;

    vec2 pos=vec2(x,y);
    pos=pos/2.0+0.5;


    vec2 pp=p-pos;
    #ifndef CENTER
        pp-=vec2(width,height*aspect);
    #endif

    pp=pp*rot(rotate*DEG2RAD/45.0);

    float roundn=roundness*min(width,height);

    vec2 size=max(vec2(width,height*aspect)-roundn,0.0);
    vec2 absPos=abs(pp)-size;

    d=max(absPos.x,absPos.y);
    d=min(d,length(max(absPos,0.0))-roundn);
    d=step(0.0,d);


    // col=vec4( _blend(base.rgb,vec3(r,g,b)) ,1.0);
    // col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*a*(1.0-d)*amount),1.0);
    // outColor=col;

    outColor=cgl_blendPixel(base,col,amount*(1.0-d));
    // outColor=vec4(1.0,1.0,1.0,1.0-d);


}



