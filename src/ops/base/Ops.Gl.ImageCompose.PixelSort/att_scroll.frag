
// https://www.shadertoy.com/view/XdcGWf
// https://www.shadertoy.com/view/4dcGDf

IN vec2 texCoord;

UNI sampler2D tex;
UNI float frame;
UNI float width;
UNI float height;

#ifdef MASK
    UNI sampler2D texMask;
#endif

#ifdef GROUP
    UNI sampler2D texGroup;
#endif



float getValue(vec3 color)
{
    #ifdef SORT_R
        return color.r;
    #endif
    #ifdef SORT_G
        return color.g;
    #endif
    #ifdef SORT_B
        return color.b;
    #endif
    #ifdef SORT_LUM
        return dot(vec3(0.2126,0.7152,0.0722), color);
    #endif
}


vec2 myclamp(vec2 v)
{
    v=abs(v);
    v=clamp(v,0.0,0.999);
    return v;
}

void main()
{
    float onePixelW=1.0/width;
    float onePixelH=1.0/height;

    float pixel=floor(texCoord.x/onePixelW);
    float x=pixel*onePixelW+(onePixelW*0.5);
    float y=texCoord.y;
    vec2 off=vec2(onePixelW,0.0);

    #ifdef STR_COLS
        pixel=floor(texCoord.y/onePixelH);
        y=pixel*onePixelH+(onePixelH*0.5);
        x=texCoord.x;
        off=vec2(0.0,onePixelH);
    #endif

    #ifdef INVERT
        off*=-1.0;
    #endif

    vec4 colM=texture(tex,myclamp(texCoord-off));
    vec4 col= texture(tex,myclamp(texCoord));
    vec4 colP=texture(tex,myclamp(texCoord+off));

    #ifdef GROUP
        vec4 gColM=texture(texGroup,myclamp(texCoord-off));
        vec4 gCol= texture(texGroup,myclamp(texCoord));
        vec4 gColP=texture(texGroup,myclamp(texCoord+off));

    #endif



    #ifdef MASK
        if(texture(texMask,texCoord).r>0.5 )
        {
    #endif

    if( int(mod(pixel+frame,2.0))==0)
    {
        #ifdef GROUP
        if(gCol.r==gColP.r)
        {
        #endif

        if ((getValue(colP.rgb) > getValue(col.rgb))) col = colP;

        #ifdef GROUP
        }
        #endif


    }
    else
    {
        #ifdef GROUP
        if(gCol.r==gColM.r)
        {
        #endif

        if ((getValue(colM.rgb) < getValue(col.rgb))) col = colM;

        #ifdef GROUP
        }
        #endif

    }

    #ifdef MASK
        }
    #endif


    outColor=col;
}