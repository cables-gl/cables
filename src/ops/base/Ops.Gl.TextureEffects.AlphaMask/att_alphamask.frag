IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D image;

void main()
{
   vec4 col=vec4(0.0,0.0,0.0,1.0);
   col=texture(tex,texCoord);

   #ifdef FROM_RED
       col.a=texture(image,texCoord).r;
   #endif

   #ifdef FROM_GREEN
       col.a=texture(image,texCoord).g;
   #endif

   #ifdef FROM_BLUE
       col.a=texture(image,texCoord).b;
   #endif

   #ifdef FROM_ALPHA
       col.a=texture(image,texCoord).a;
   #endif

   #ifdef FROM_LUMINANCE
       vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), texture(image,texCoord).rgb ));
       col.a=(gray.r+gray.g+gray.b)/3.0;
   #endif

   outColor= col;
}