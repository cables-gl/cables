UNI sampler2D tex;
UNI sampler2D texMul;
IN vec2 texCoord;
IN vec2 texPos;
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
   if(col.a==0.0)discard;

    #ifdef DO_MULTEX
        col*=texture(texMul,texPos);
    #endif


   outColor=col;
}