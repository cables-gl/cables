IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI bool invertColor;
UNI float lineThicknessX;
UNI float lineThicknessY;
UNI float cellsX;
UNI float cellsY;
UNI float offsetX;
UNI float offsetY;
UNI float rotate;

UNI float lineR;
UNI float lineG;
UNI float lineB;

{{BLENDCODE}}

#define PI 3.14159265
#define TAU (2.0*PI)

void pR(inout vec2 p, float a)
{
	p = cos(a)*p + sin(a)*vec2(p.y, -p.x);
}

float vmax(vec2 v) 
{
	return max(v.x, v.y);
}
float fBox2(vec2 p, vec2 b)
{
	vec2 d = abs(p) - b;
	return length(max(d, vec2(0.0))) + vmax(min(d, vec2(0.0)));
}

vec2 pMod2(inout vec2 p, vec2 size)
{
	vec2 c = floor((p + size*0.5)/size);
	p = mod(p + size*0.5,size) - size*0.5;
	return c;
}
void main()
{
    vec2 uv = texCoord;
    uv -= 0.5;
    pR(uv.xy,rotate * (TAU));
    uv += 0.5;
    uv *= vec2(cellsX,cellsY);
    uv -= 0.5;
    uv -= vec2(offsetX,offsetY);
    pMod2(uv,vec2(1.));
    
    float box = 0.0;
    
    if(invertColor) box = 1.0 - sign(fBox2(uv,vec2(lineThicknessX,lineThicknessY)));
        else box = sign(fBox2(uv,vec2(lineThicknessX,lineThicknessY)));
    vec4 color = vec4(vec3(box) * vec3(lineR,lineG,lineB),1.0);
    
    //blend section
    vec4 col=vec4(color);
    //original texture
    vec4 base=texture(tex,texCoord);
    //blend stuff
    col=vec4( _blend(base.rgb,col.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);
    outColor= col;
}