
IN vec2 texCoord;

UNI vec4 color;
UNI sampler2D tex;

{{MODULES_HEAD}}
void main()
{
    vec4 col=color;

    #ifdef USE_TEXTURE
        #ifdef COLORIZE_TEX
            col*=texture(tex,texCoord);
        #endif
        #ifndef COLORIZE_TEX
            col=texture(tex,texCoord);
        #endif
    #endif

    {{MODULE_COLOR}}
    outColor = col;
}