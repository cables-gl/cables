UNI sampler2D texRandoms;

UNI sampler2D texInput0;
UNI sampler2D texFeedback0;

UNI sampler2D texInput1;
UNI sampler2D texFeedback1;


#ifdef USE_MASK
UNI sampler2D texMask;
#endif

IN vec2 texCoord;

UNI float column;
UNI float width;

void main()
{
    #define SCROLLING

    vec4 col=texture(texFeedback0,vec2(texCoord.x-(1.0/width),texCoord.y));
    vec4 col1=texture(texFeedback1,vec2(texCoord.x-(1.0/width),texCoord.y));
    col1.a=col.a;

    #ifdef SCROLLING
        if(texCoord.x*width<2.0)
    #endif
    #ifndef SCROLLING
        if(column>=floor(texCoord.x*width) && column<=ceil(texCoord.x*width)+2.0)
    #endif
    {
        vec4 theTexCoords = texture(texRandoms, vec2(texCoord.x,texCoord.y));

        vec4 ncol=texture(texInput0,theTexCoords.xy);

        // if( ncol.xyz!=vec3(0.0) && abs( distance(col.xyz, ncol.xyz) ) > 3.1) ncol.a=0.0;
        // else ncol.a=1.0;

        // if(ncol.xyz==vec3(0.0))ncol.a=0.0;

        col=ncol;
        col1=texture(texInput1,theTexCoords.xy);


    }


    outColor0=col;
    outColor1=col1;

}