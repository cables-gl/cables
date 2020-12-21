UNI float a;
UNI sampler2D tex;

#ifdef TEX_MASK
UNI sampler2D texMask;
#endif

IN vec2 texCoord;

void main()
{
    vec4 col=texture(tex,texCoord);

    #ifdef TEX_MASK
        col.a=texture(texMask,texCoord).r;
    #endif

    outColor= col;
}