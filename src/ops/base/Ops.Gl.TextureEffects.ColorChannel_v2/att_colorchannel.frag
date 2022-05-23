IN vec2 texCoord;
UNI sampler2D tex;

void main()
{
    vec4 color=texture(tex,texCoord);
    vec4 col=vec4(0.0,0.0,0.0,color.a);

   #ifdef CHANNEL_R
        col.r=color.r;
        #ifdef MONO
            col.g=col.b=col.r;
        #endif
   #endif

   #ifdef CHANNEL_G
       col.g=color.g;
       #ifdef MONO
            col.r=col.b=col.g;
       #endif
   #endif

   #ifdef CHANNEL_B
       col.b=color.b;
       #ifdef MONO
            col.g=col.r=col.b;
       #endif
   #endif

   #ifdef CHANNEL_A
       col.r=col.g=col.b=color.a;
   #endif

   outColor = col;
}