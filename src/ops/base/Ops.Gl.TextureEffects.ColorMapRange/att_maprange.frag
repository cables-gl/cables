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
    #endif
    #ifdef CH_G
        col.g=map(col.g);
    #endif
    #ifdef CH_B
        col.b=map(col.b);
    #endif
    #ifdef CH_A
        col.a=map(col.a);
    #endif

    outColor = col;
}