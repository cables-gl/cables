IN vec2 texCoord;
UNI vec4 bgColor;
UNI sampler2D tex;
#ifdef USE_UVTEX
UNI sampler2D UVTex;
#endif

void main()
{

    #ifndef USE_TEX
        outColor=bgColor;
    #endif
    #ifdef USE_TEX
        #ifndef USE_UVTEX
        outColor=texture(tex,texCoord);
        #else
        outColor=texture(tex,texture(UVTex,texCoord).xy);
        #endif
    #endif



}
