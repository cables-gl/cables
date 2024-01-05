{{MODULES_HEAD}}

IN vec2 texCoord;

#ifdef VERTEX_COLORS
IN vec4 vertCol;
#endif

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
        vec2 uv=texCoord;

        #ifdef CROP_TEXCOORDS
            if(uv.x<0.0 || uv.x>1.0 || uv.y<0.0 || uv.y>1.0) discard;
        #endif

        #ifdef HAS_TEXTURE_DIFFUSE
            col=texture(tex,uv);

            #ifdef COLORIZE_TEXTURE
                col.r*=color.r;
                col.g*=color.g;
                col.b*=color.b;
            #endif
        #endif
        col.a*=color.a;
        #ifdef HAS_TEXTURE_OPACITY
            #ifdef TRANSFORMALPHATEXCOORDS
                uv=texCoordOrig;
            #endif
            #ifdef ALPHA_MASK_IR
                col.a*=1.0-texture(texOpacity,uv).r;
            #endif
            #ifdef ALPHA_MASK_IALPHA
                col.a*=1.0-texture(texOpacity,uv).a;
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

    #ifdef VERTEX_COLORS
        col*=vertCol;
    #endif

    outColor = col;
}
