IN vec2 texCoord;

void main()
{
   vec4 col=vec4(texCoord.x,texCoord.y,1.0,1.0);
   outColor= col;
}