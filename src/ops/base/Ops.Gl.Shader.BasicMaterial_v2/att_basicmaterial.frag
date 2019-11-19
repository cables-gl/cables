{{MODULES_HEAD}}

IN vec2 texCoord;
UNI vec4 color;
// UNI float r;
// UNI float g;
// UNI float b;
// UNI float a;

#ifdef HAS_TEXTURES
    IN vec2 texCoordOrig;
    #ifdef HAS_TEXTURE_DIFFUSE
        UNI sampler2D tex;
    #endif
    #ifdef HAS_TEXTURE_OPACITY
        UNI sampler2D texOpacity;
   #endif
#endif

void main()
{
    {{MODULE_BEGIN_FRAG}}
    vec4 col=color;

    #ifdef HAS_TEXTURES
        vec2 uv=vec2(texCoord.s,1.0-texCoord.t);

        #ifdef HAS_TEXTURE_DIFFUSE
            col=texture(tex,uv);

            #ifdef COLORIZE_TEXTURE
                col.r*=color.r;
                col.g*=color.g;
                col.b*=color.b;
            #endif
        #endif
        col.a*=a;
        #ifdef HAS_TEXTURE_OPACITY
            #ifdef TRANSFORMALPHATEXCOORDS
                uv=vec2(texCoordOrig.s,1.0-texCoordOrig.t);
            #endif
            #ifdef ALPHA_MASK_ALPHA
                col.a*=texture(texOpacity,uv).a;
            #endif
            #ifdef ALPHA_MASK_LUMI
                col.a*=dot(vec3(0.2126,0.7152,0.0722), texture(texOpacity,uv).rgb);
            #endif
            #ifdef ALPHA_MASK_R
                col.a*=texture(texOpacity,uv).r;
            #endif
            #ifdef ALPHA_MASK_G
                col.a*=texture(texOpacity,uv).g;
            #endif
            #ifdef ALPHA_MASK_B
                col.a*=texture(texOpacity,uv).b;
            #endif
            // #endif
        #endif
    #endif

    {{MODULE_COLOR}}

    #ifdef DISCARDTRANS
        if(col.a<0.2) discard;
    #endif

    outColor = col;
}
