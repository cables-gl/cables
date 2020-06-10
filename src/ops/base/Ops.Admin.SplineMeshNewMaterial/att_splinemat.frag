
IN vec2 texCoord;

UNI vec4 color;
UNI sampler2D tex;

{{MODULES_HEAD}}
void main()
{
    vec4 col=color;

    #ifdef USE_TEXTURE
        #ifdef TEX_COLORIZE
            col*=texture(tex,texCoord);
        #endif
        #ifndef TEX_COLORIZE
            col=texture(tex,texCoord);
        #endif
    #endif

    col.a=1.0;

    {{MODULE_COLOR}}
    outColor = col;
}