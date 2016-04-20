precision highp float;


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

#ifdef HAS_TEXTURES
   vec2 texCoords=texCoord;
#endif

{{MODULE_BEGIN_FRAG}}


   vec4 col=vec4(r,g,b,a);
   #ifdef HAS_TEXTURES
      #ifdef HAS_TEXTURE_DIFFUSE

           #ifdef TEXTURED_POINTS
               col=texture2D(tex,vec2(gl_PointCoord.x,(1.0-gl_PointCoord.y)));
           #endif
           #ifndef TEXTURED_POINTS
               col=texture2D(tex,vec2(texCoord.x,(1.0-texCoord.y)));
           #endif

//         col=texture2D(tex,vec2(texCoords.x*1.0,(1.0-texCoords.y)*1.0));
           #ifdef COLORIZE_TEXTURE
               col.r*=r;
               col.g*=g;
               col.b*=b;
           #endif
      #endif
      #ifdef HAS_TEXTURE_OPACITY
          col.a*=texture2D(texOpacity,texCoords).g;
       #endif
       col.a*=a;
   #endif
{{MODULE_COLOR}}

   gl_FragColor = col;
}
