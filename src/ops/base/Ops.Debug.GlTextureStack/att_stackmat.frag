
IN vec2 texCoord;

void main()
{
    float idx=floor(texCoord.x*16.0);
    vec2 nc=vec2(fract(texCoord.x*16.0),texCoord.y*16.0);

if(nc.y>1.0)discard;


{{DYNCODE}}

if(nc.x<0.03 || nc.y<0.03)outColor=vec4(1.0,0.0,0.0,1.0);

}