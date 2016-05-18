precision highp float;

{{MODULES_HEAD}}

#ifdef HAS_TEXTURES
   varying vec2 texCoord;
   #ifdef HAS_TEXTURE_DIFFUSE
       uniform sampler2D tex;
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

           col=texture2D(tex,vec2(gl_PointCoord.x,(1.0-gl_PointCoord.y)));

           #ifdef COLORIZE_TEXTURE
               col.r*=r;
               col.g*=g;
               col.b*=b;
           #endif
      #endif
      col.a*=a;
   #endif

    {{MODULE_COLOR}}


    #ifdef MAKE_ROUND
        if ((gl_PointCoord.x-0.5)*(gl_PointCoord.x-0.5) + (gl_PointCoord.y-0.5)*(gl_PointCoord.y-0.5) > 0.25) discard; //col.a=0.0;
    #endif

    gl_FragColor = col;
}
