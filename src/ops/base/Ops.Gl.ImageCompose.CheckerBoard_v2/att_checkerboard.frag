IN vec2 texCoord;
UNI sampler2D tex;
UNI float numX;
UNI float numY;
UNI float amount;
UNI float rotate;
UNI float aspect;

{{CGL.BLENDMODES3}}

#define PI 3.14159265
#define TAU (2.0*PI)

void pR(inout vec2 p, float a)
{
	p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

void main()
{
    vec2 uv=texCoord-0.5;
    pR(uv.xy,rotate * (TAU));
    // uv = vec2(texCoord.x,texCoord.y*aspect)-0.5;

    #ifdef CENTER
        uv+=vec2(0.5,0.5);
    #endif

    float asp=1.0;
    float nY=numY;
    #ifdef SQUARE
        asp=aspect;
        nY=numX/aspect;

    #endif

    float total = floor(uv.x*numX-numX/2.0) +floor(uv.y/asp*nY-nY/2.0);
    float r = mod(total,2.0);

    vec4 col=vec4(r,r,r,1.0);
    vec4 base=texture(tex,texCoord);
    outColor=cgl_blendPixel(base,col,amount);
}