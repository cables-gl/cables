
{{MODULES_HEAD}}

UNI vec4 color;
IN vec2 texCoord;
IN vec2 pointCoord;

#ifdef HAS_TEXTURE_DIFFUSE
    UNI sampler2D diffTex;
#endif
#ifdef HAS_TEXTURE_MASK
    UNI sampler2D texMask;
#endif
#ifdef HAS_TEXTURE_COLORIZE
    IN vec4 colorize;
#endif
#ifdef VERTEX_COLORS
    IN vec3 vertexColor;
#endif

void main()
{
    {{MODULE_BEGIN_FRAG}}

    #ifdef FLIP_TEX
        vec2 pointCoord=vec2(gl_PointCoord.x,(1.0-gl_PointCoord.y));
    #endif
    #ifndef FLIP_TEX
        vec2 pointCoord=gl_PointCoord;
    #endif

    vec4 col=color;

    #ifdef HAS_TEXTURES

        #ifdef HAS_TEXTURE_MASK
            float mask;
            mask=texture(texMask,pointCoord).r;
        #endif

        #ifdef HAS_TEXTURE_DIFFUSE
            col=texture(diffTex,pointCoord);
            #ifdef COLORIZE_TEXTURE
              col.rgb*=color.rgb;
            #endif
        #endif
        col.a*=color.a;
    #endif

    {{MODULE_COLOR}}

    #ifdef MAKE_ROUND
        if ((gl_PointCoord.x-0.5)*(gl_PointCoord.x-0.5) + (gl_PointCoord.y-0.5)*(gl_PointCoord.y-0.5) > 0.25) discard; //col.a=0.0;
    #endif

    #ifdef VERTEX_COLORS
        col.rgb*=vertexColor;
    #endif

    #ifdef HAS_TEXTURE_COLORIZE
        col*=colorize;
    #endif

    #ifdef HAS_TEXTURE_MASK
        col.a=mask;
    #endif

    outColor = col;
}
