IN vec2 texCoord;
UNI sampler2D tex;
UNI float r;
UNI float g;
UNI float b;

void main()
{
   vec4 col=vec4(1.0,0.0,0.0,1.0);
   col=texture(tex,texCoord);
   col.r*=r;
   col.g*=g;
   col.b*=b;
   outColor= col;
}
