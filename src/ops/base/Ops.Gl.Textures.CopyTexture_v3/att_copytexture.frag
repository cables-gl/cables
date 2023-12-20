UNI float a;
UNI sampler2D tex;

#ifdef TEX_MASK
UNI sampler2D texMask;
#endif

IN vec2 texCoord;

void main()
{
    vec4 col=texture(tex,texCoord);

    #ifdef TEX_MASK
        col.a=texture(texMask,texCoord).r;
    #endif


    #ifdef GREY_R
        col.rgb=vec3(col.r);
    #endif

    #ifdef GREY_G
        col.rgb=vec3(col.g);
    #endif

    #ifdef GREY_B
        col.rgb=vec3(col.b);
    #endif

    #ifdef GREY_A
        col.rgb=vec3(col.a);
    #endif

    #ifdef GREY_LUMI
        col.rgb=vec3( dot(vec3(0.2126,0.7152,0.0722), col.rgb) );
    #endif


    #ifdef INVERT_A
        col.a=1.0-col.a;
    #endif

    #ifdef INVERT_R
        col.r=1.0-col.r;
    #endif

    #ifdef INVERT_G
        col.g=1.0-col.g;
    #endif

    #ifdef INVERT_B
        col.b=1.0-col.b;
    #endif

    #ifdef ALPHA_1
        col.a=1.0;
    #endif




    outColor= col;
}