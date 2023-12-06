
#ifdef HAS_TEXTURES
  IN vec2 texCoord;
  UNI sampler2D tex;
#endif
UNI float amount;
UNI float lum;
UNI float add;
UNI float lineSize;
UNI float scroll;
UNI float displace;


void main()
{
   vec4 col=vec4(1.0,0.0,0.0,1.0);

   col=texture(tex,texCoord);
    // .endl()+'   col=clamp(col,0.0,1.0);'

    float dir;
    #ifdef DIRECTION
        dir = gl_FragCoord.x;
    #endif

    #ifndef DIRECTION
        dir = gl_FragCoord.y;
    #endif

   if( mod(dir+scroll,lineSize)>=lineSize*0.5)
   {
       col=texture(tex,vec2(texCoord.x+displace*0.05,texCoord.y));
       float gray = vec3(dot(vec3(0.2126,0.7152,0.0722), col.rgb)).r;
       col.rgb=col.rgb*(1.0-amount) + (col.rgb*gray*gray*lum)*amount;
   }
   else col+=add;


   outColor= col;
}