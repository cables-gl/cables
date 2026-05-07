{{MODULES_HEAD}}

IN vec2 texCoord;
IN vec2 texCoord1;


#ifdef HAS_TEXTURES
    IN vec2 texCoordOrig;
    UNI sampler2D texDiffuse;
#endif

///

void main()
{
    {{MODULE_BEGIN_FRAG}}
    vec4 col=vec4(1.);

    #ifdef HAS_TEXTURES
        vec2 uv=texCoord;
        col=texture(texDiffuse,uv);
        // col.b=1.0;
    #endif

    {{MODULE_COLOR}}
    outColor = col;
}
