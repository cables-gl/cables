{{MODULES_HEAD}}


#ifdef HAS_TEXTURES
    varying vec2 texCoord;
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
      #ifdef HAS_TEXTURE_OPACITY
          col.a*=texture2D(texOpacity,vec2(texCoord.s,1.0-texCoord.t)).g;
       #endif
       col.a*=a;
   #endif
{{MODULE_COLOR}}


   outColor = col;
}
