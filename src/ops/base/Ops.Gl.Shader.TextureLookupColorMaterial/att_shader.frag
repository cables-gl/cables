{{MODULES_HEAD}}

#ifdef HAS_TEXTURES
   IN vec2 texCoord;
   #ifdef HAS_TEXTURE_DIFFUSE
       UNI sampler2D tex;
   #endif
   #ifdef HAS_TEXTURE_OPACITY
       UNI sampler2D texOpacity;
   #endif
#endif
UNI float a;
UNI float posX;
UNI float posY;

void main()
{

#ifdef HAS_TEXTURES
   vec2 texCoords=texCoord;
#endif

{{MODULE_BEGIN_FRAG}}

   vec4 col=vec4(1.0,1.0,1.0,a);
   #ifdef HAS_TEXTURES
      #ifdef HAS_TEXTURE_DIFFUSE
           col=texture2D(tex,vec2(posX,posY));
      #endif
      #ifdef HAS_TEXTURE_OPACITY
          col.a*=texture2D(texOpacity,texCoords).g;
      #endif
      col.a*=a;
   #endif
{{MODULE_COLOR}}

   outColor= col;
}
