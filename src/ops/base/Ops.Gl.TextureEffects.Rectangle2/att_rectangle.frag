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

UNI float rotate;
UNI float roundness;

#define DEG2RAD 0.785398163397

mat2 rot(float angle)
{
    float s=sin(angle);
    float c=cos(angle);
    
    return mat2(c,-s,s,c);
}

// polynomial smooth min (k = 0.1);
float smin( float a, float b, float k )
{
    float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
    return mix( b, a, h ) - k*h*(1.0-h);
}

void main()
{
    vec4 col=texture(tex,texCoord);
    vec4 newcol;
    vec2 p=texCoord*2.0-1.0;
    float d=1.0;

    vec2 pp=vec2(p.x-x,p.y-y);

    pp=pp*rot(rotate*DEG2RAD/45.0);
    
    float roundn=roundness*min(width,height);

    vec2 size=max(vec2(width,height)-roundn,0.0);
    vec2 absPos=abs(pp)-size;

    d=max(absPos.x,absPos.y);
    d=min(d,length(max(absPos,0.0))-roundn);
    d=step(0.0,d);

    // d+=absPos.x+1.0;
    // d=max(d,0.0);
    // d=max(d,0.0);




    outColor = vec4( (1.0-d)*vec3(r,g,b),1.0);
}



















