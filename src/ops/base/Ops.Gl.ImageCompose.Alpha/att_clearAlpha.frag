
// void main()
// {
//     outColor.a=0.0;
// }

IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;


void main()
{
    vec4 base=texture(tex,texCoord);

    outColor=base;

    #ifdef METH_NORM
        outColor.a=amount;
    #endif
    #ifdef METH_ADD
        outColor.a+=amount;
    #endif
    #ifdef METH_SUB
        outColor.a-=amount;
    #endif
    #ifdef METH_MUL
        outColor.a*=amount;
    #endif

    #ifdef DO_CLAMP
    outColor.a=clamp(0.0,1.0,outColor.a);
    #endif

}
