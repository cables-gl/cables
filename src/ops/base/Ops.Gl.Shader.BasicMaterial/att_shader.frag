{{MODULES_HEAD}}

IN vec2 texCoord;
#ifdef HAS_TEXTURES
    IN vec2 texCoordOrig;
    #ifdef HAS_TEXTURE_DIFFUSE
        UNI sampler2D tex;
    #endif
    #ifdef HAS_TEXTURE_OPACITY
        UNI sampler2D texOpacity;
   #endif
#endif
UNI float r;
UNI float g;
UNI float b;
UNI float a;

void main()
{
    {{MODULE_BEGIN_FRAG}}
    vec4 col=vec4(r,g,b,a);

    #ifdef HAS_TEXTURES
        #ifdef HAS_TEXTURE_DIFFUSE

           col=texture(tex,vec2(texCoord.x,(1.0-texCoord.y)));

           #ifdef COLORIZE_TEXTURE
               col.r*=r;
               col.g*=g;
               col.b*=b;
           #endif
        #endif

        col.a*=a;
        #ifdef HAS_TEXTURE_OPACITY
            #ifdef TRANSFORMALPHATEXCOORDS
                col.a*=texture(texOpacity,vec2(texCoordOrig.s,1.0-texCoordOrig.t)).g;
            #endif
            #ifndef TRANSFORMALPHATEXCOORDS
                col.a*=texture(texOpacity,vec2(texCoord.s,1.0-texCoord.t)).g;
            #endif
       #endif

    #endif

    {{MODULE_COLOR}}

    outColor = col;


}
