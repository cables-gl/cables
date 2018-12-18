UNI float a;
UNI sampler2D tex;
IN vec2 texCoord;

void main()
{
   vec4 col=texture(tex,texCoord);
   outColor= col;
}