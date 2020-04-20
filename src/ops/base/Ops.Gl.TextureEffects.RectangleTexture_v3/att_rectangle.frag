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

{{CGL.BLENDMODES}}

mat2 rot(float angle)
{
    float s=sin(angle);
    float c=cos(angle);

    return mat2(c,-s,s,c);
}

// polynomial smooth min (k = 0.1);
// float smin( float a, float b, float k )
// {
//     float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
//     return mix( b, a, h ) - k*h*(1.0-h);
// }

void main()
{
    vec4 base=texture(tex,texCoord);
    vec4 col;
    vec2 p=texCoord;

    p.y=1.0-p.y;
    p.y*=aspect;
    float d=1.0;

    vec2 pp=vec2(p.x-x,p.y-y);
    pp-=vec2(width/2.0,height/2.0);
    pp=pp*rot(rotate*DEG2RAD/45.0);

    float roundn=roundness*min(width,height);

    vec2 size=max(vec2(width/2.0,height/2.0)-roundn,0.0);
    vec2 absPos=abs(pp)-size;

    d=max(absPos.x,absPos.y);
    d=min(d,length(max(absPos,0.0))-roundn);
    d=step(0.0,d);

    // d+=absPos.x+1.0;
    // d=max(d,0.0);
    // d=max(d,0.0);

    // col = vec4( (1.0-d)*vec3(r,g,b),1.0);

    col=vec4( _blend(base.rgb,vec3(r,g,b)) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*(1.0-d)*amount),1.0);
    outColor=col;
    // outColor= cgl_blend(base,col,amount);


}



