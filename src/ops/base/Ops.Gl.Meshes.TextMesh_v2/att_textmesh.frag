UNI sampler2D tex;
#ifdef DO_MULTEX
    UNI sampler2D texMul;
#endif
#ifdef DO_MULTEX_MASK
    UNI sampler2D texMulMask;
#endif
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

    #ifdef DO_MULTEX_MASK
        col*=texture(texMulMask,texPos).r;
    #endif


   outColor=col;
}