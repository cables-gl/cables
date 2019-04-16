IN vec2 texCoord;

void main()
{
   vec4 col=vec4(mod(texCoord.x,1.0),mod(texCoord.y,1.0),1.0,1.0);
   outColor= col;
}