
UNI sampler2D texCoords;
UNI sampler2D texOld;
UNI sampler2D texRandoms;

UNI sampler2D texPassThrough1;

#ifdef USE_MASK
UNI sampler2D texMask;
#endif

IN vec2 texCoord;

UNI float column;
UNI float width;

void main()
{
    #define SCROLLING

    vec4 col=texture(texOld,vec2(texCoord.x-(1.0/width),texCoord.y));

    #ifdef SCROLLING
        if(texCoord.x*width<2.0)
    #endif
    #ifndef SCROLLING
        if(column>=floor(texCoord.x*width) && column<=ceil(texCoord.x*width)+2.0)
    #endif
    {
        vec4 theTexCoords = texture(texRandoms, vec2(texCoord.x,texCoord.y));

        col=texture(texCoords,theTexCoords.xy);


        #ifdef USE_MASK
            // if(texture(texMask,texCoord.xy).r>0.00)col.a=1.0;
            // else col.a=0.0;
                // col.a=texture(texMask,texCoord.xy).r;

        #endif


    }


    outColor= col;
}