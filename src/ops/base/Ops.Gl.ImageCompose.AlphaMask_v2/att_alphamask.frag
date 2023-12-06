IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D image;
UNI float amount;

void main()
{
    vec4 col=vec4(0.0,0.0,0.0,1.0);
    col=texture(tex,texCoord);

#ifdef USE_TEXTURE
    float newAlpha=0.0;

    #ifdef FROM_RED
       newAlpha=texture(image,texCoord).r;
    #endif

    #ifdef FROM_GREEN
       newAlpha=texture(image,texCoord).g;
    #endif

    #ifdef FROM_BLUE
       newAlpha=texture(image,texCoord).b;
    #endif

    #ifdef FROM_ALPHA
       newAlpha=texture(image,texCoord).a;
    #endif

    #ifdef FROM_LUMINANCE
       float gray = dot(vec3(0.2126,0.7152,0.0722), texture(image,texCoord).rgb );
       newAlpha=gray;
    #endif


    newAlpha*=amount;

    #ifdef INVERT
        newAlpha=1.0-newAlpha;
    #endif

    #ifdef METH_OVERRIDE
        col.a=newAlpha;
    #endif
    #ifdef METH_ADD
        col.a+=newAlpha;
    #endif
    #ifdef METH_MUL
        col.a*=newAlpha;
    #endif

#endif
#ifndef USE_TEXTURE
    col.a*=amount;
    // col.g=1.0;
#endif

    outColor= col;
}