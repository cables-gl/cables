IN vec2 texCoord;
UNI vec4 bgColor;
UNI sampler2D tex;

void main()
{

    #ifndef USE_TEX
        outColor=bgColor;
    #endif
    #ifdef USE_TEX
        outColor=texture(tex,texCoord);
    #endif



}
