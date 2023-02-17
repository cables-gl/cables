
UNI sampler2D texCoords;
UNI sampler2D texOld;
UNI sampler2D texRandoms;
IN vec2 texCoord;

UNI float column;
UNI float width;

void main()
{

#define SCROLLING


    // vec4 col =texture(texOld,texCoord);
    vec4 col=texture(texOld,vec2(texCoord.x-(1.0/width),texCoord.y));




#define SCROLLING

    #ifdef SCROLLING
        if(texCoord.x*width<2.0)
    #endif
    #ifndef SCROLLING
        if(column>=floor(texCoord.x*width) && column<=ceil(texCoord.x*width)+2.0)
    #endif
    {
        // col=vec4(1., 0., 0., 1.0);
        vec4 theTexCoords = texture(texRandoms, vec2(texCoord.x,texCoord.y));

        col=texture(texCoords,theTexCoords.xy);
    }

    outColor= col;
}