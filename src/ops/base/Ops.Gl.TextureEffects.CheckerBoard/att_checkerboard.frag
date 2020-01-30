IN vec2 texCoord;
UNI sampler2D tex;
UNI float lineSize;
UNI float amount;
UNI float rotate;

{{CGL.BLENDMODES}}

#define PI 3.14159265
#define TAU (2.0*PI)

void pR(inout vec2 p, float a)
{
	p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

void main()
{
    vec2 uv = texCoord-0.5;
    pR(uv.xy,rotate * (TAU));

    #ifdef CENTER
        uv+=0.5;
    #endif

    float total = floor(uv.x*lineSize-lineSize/2.0) +floor(uv.y*lineSize-lineSize/2.0);
    float r = mod(total,2.0);

    //blend section
    vec4 col=vec4(r,r,r,1.0);
    //original texture
    vec4 base=texture(tex,texCoord);
    //blend stuff
    outColor=cgl_blend(base,col,amount);
}