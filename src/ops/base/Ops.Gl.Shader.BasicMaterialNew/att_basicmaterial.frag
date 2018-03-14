{{MODULES_HEAD}}

IN vec2 texCoord;
#ifdef HAS_TEXTURES
    IN vec2 texCoordOrig;
    #ifdef HAS_TEXTURE_DIFFUSE
        uniform sampler2D tex;
    #endif
    #ifdef HAS_TEXTURE_OPACITY
        uniform sampler2D texOpacity;
   #endif
#endif
uniform float r;
uniform float g;
uniform float b;
uniform float a;

void main()
{
    {{MODULE_BEGIN_FRAG}}
    vec4 col=vec4(r,g,b,a);

    #ifdef HAS_TEXTURES
        #ifdef HAS_TEXTURE_DIFFUSE
            col=texture2D(tex,vec2(texCoord.x,(1.0-texCoord.y)));

//         col=texture2D(tex,vec2(texCoords.x*1.0,(1.0-texCoords.y)*1.0));
            #ifdef COLORIZE_TEXTURE
                col.r*=r;
                col.g*=g;
                col.b*=b;
            #endif
        #endif
        col.a*=a;
        #ifdef HAS_TEXTURE_OPACITY
            #ifdef TRANSFORMALPHATEXCOORDS
                col.a*=texture2D(texOpacity,vec2(texCoordOrig.s,1.0-texCoordOrig.t)).g;
            #endif
            #ifndef TRANSFORMALPHATEXCOORDS
                
                #ifdef ALPHA_MASK_ALPHA
                    col.a*=texture2D(texOpacity,vec2(texCoord.s,1.0-texCoord.t)).a;
                #endif
                #ifdef ALPHA_MASK_LUMI
                    col.a*=dot(vec3(0.2126,0.7152,0.0722), texture2D(texOpacity,vec2(texCoord.s,1.0-texCoord.t)).rgb);
                #endif
                #ifdef ALPHA_MASK_R
                    col.a*=texture2D(texOpacity,vec2(texCoord.s,1.0-texCoord.t)).r;
                #endif
                #ifdef ALPHA_MASK_G
                    col.a*=texture2D(texOpacity,vec2(texCoord.s,1.0-texCoord.t)).g;
                #endif
                #ifdef ALPHA_MASK_B
                    col.a*=texture2D(texOpacity,vec2(texCoord.s,1.0-texCoord.t)).b;
                #endif
    
                
                
                
            #endif
        #endif
    #endif

    {{MODULE_COLOR}}

    outColor = col;
}
