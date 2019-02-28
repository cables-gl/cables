IN vec2 texCoord;
// UNI sampler2D tex;
UNI float threshhold;
UNI sampler2D text;

void main()
{
   vec4 col = texture(text, texCoord );

   float gray = dot(vec3(0.2126,0.7152,0.0722), col.rgb );

   #ifndef INVERT
       if(gray < threshhold) col.r=col.g=col.b=col.a=0.0;
       #ifdef BLACKWHITE
           else col.r=col.g=col.b=col.a=1.0;
       #endif
   #endif

   #ifdef INVERT
       if(gray > threshhold) col.r=col.g=col.b=col.a=0.0;
       #ifdef BLACKWHITE
           else col.r=col.g=col.b=col.a=1.0;
       #endif
   #endif

   outColor= col;
}