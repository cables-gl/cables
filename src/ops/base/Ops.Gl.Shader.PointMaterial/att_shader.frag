precision highp float;

{{MODULES_HEAD}}

varying vec2 texCoord;
#ifdef HAS_TEXTURES
   
   #ifdef HAS_TEXTURE_DIFFUSE
       uniform sampler2D diffTex;
   #endif
   #ifdef HAS_TEXTURE_MASK
       uniform sampler2D texMask;
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

        #ifdef HAS_TEXTURE_MASK
            float mask=texture2D(texMask,vec2(gl_PointCoord.x,(1.0-gl_PointCoord.y))).r;
        #endif

        #ifdef HAS_TEXTURE_DIFFUSE

            #ifdef LOOKUP_TEXTURE
                col=texture2D(diffTex,texCoord);
            #endif
            #ifndef LOOKUP_TEXTURE
                col=texture2D(diffTex,vec2(gl_PointCoord.x,(1.0-gl_PointCoord.y)));
            #endif

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

    #ifdef HAS_TEXTURE_MASK
        col.a=mask;
    #endif


    // #ifdef RANDOMIZE_COLOR
        // col.rgb*=fract(sin(dot(texCoord.xy ,vec2(12.9898,78.233))) * 43758.5453);
    // #endif

    outColor = col;
}
