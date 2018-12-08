UNI sampler2D tex;
IN vec2 texCoord;
UNI float r;
UNI float g;
UNI float b;
UNI float a;

void main()
{
   vec4 col=texture(tex,texCoord);
   col.a=col.r;
   col.r*=r;
   col.g*=g;
   col.b*=b;
   col*=a;

   outColor=col;
}