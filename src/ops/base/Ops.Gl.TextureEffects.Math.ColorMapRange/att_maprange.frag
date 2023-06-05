IN vec2 texCoord;
UNI sampler2D tex;

UNI float min1,min2,max1,max2;

float map(float value)
{
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main()
{
    vec4 col=texture(tex,texCoord);

    #ifdef CH_R
        col.r=map(col.r);
        #ifdef CLAMP
            col.r=clamp(col.r,min2,max2);
        #endif
    #endif
    #ifdef CH_G
        col.g=map(col.g);
        #ifdef CLAMP
            col.g=clamp(col.g,min2,max2);
        #endif
    #endif
    #ifdef CH_B
        col.b=map(col.b);
        #ifdef CLAMP
            col.b=clamp(col.b,min2,max2);
        #endif
    #endif
    #ifdef CH_A
        col.a=map(col.a);
        #ifdef CLAMP
            col.a=clamp(col.a,min2,max2);
        #endif
    #endif

    outColor = col;
}