IN vec2 texCoord;
UNI sampler2D tex;

void main()
{
    vec4 color=texture(tex,texCoord);
    vec4 col=vec4(0.0,0.0,0.0,color.a);

   #ifdef CHANNEL_R_R
        col.r=color.r;
   #endif
   #ifdef CHANNEL_R_G
        col.r=color.g;
   #endif
   #ifdef CHANNEL_R_B
        col.r=color.b;
   #endif
   #ifdef CHANNEL_R_A
        col.r=color.a;
   #endif
   #ifdef CHANNEL_R_1
        col.r=1.;
   #endif
   #ifdef CHANNEL_R_0
        col.r=0.;
   #endif



   #ifdef CHANNEL_G_R
        col.g=color.r;
   #endif
   #ifdef CHANNEL_G_G
        col.g=color.g;
   #endif
   #ifdef CHANNEL_G_B
        col.g=color.b;
   #endif
   #ifdef CHANNEL_G_A
        col.g=color.a;
   #endif
   #ifdef CHANNEL_G_1
        col.g=1.;
   #endif
   #ifdef CHANNEL_G_0
        col.g=0.;
   #endif




   #ifdef CHANNEL_B_R
        col.b=color.r;
   #endif
   #ifdef CHANNEL_B_G
        col.b=color.g;
   #endif
   #ifdef CHANNEL_B_B
        col.b=color.b;
   #endif
   #ifdef CHANNEL_B_A
        col.b=color.a;
   #endif
   #ifdef CHANNEL_B_1
        col.b=1.;
   #endif
   #ifdef CHANNEL_B_0
        col.b=0.;
   #endif





   #ifdef CHANNEL_A_R
        col.a=color.r;
   #endif
   #ifdef CHANNEL_A_G
        col.a=color.g;
   #endif
   #ifdef CHANNEL_A_B
        col.a=color.b;
   #endif
   #ifdef CHANNEL_A_A
        col.a=color.a;
   #endif
   #ifdef CHANNEL_A_1
        col.a=1.;
   #endif
   #ifdef CHANNEL_A_0
        col.a=0.;
   #endif






   outColor = col;
}