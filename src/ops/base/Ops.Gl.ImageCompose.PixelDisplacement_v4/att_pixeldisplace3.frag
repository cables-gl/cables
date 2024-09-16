IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D displaceTex;
UNI float amountX;
UNI float amountY;
UNI float amount;

#ifdef MAPPING_REPEAT
    UNI vec2 repeat;
#endif

{{CGL.BLENDMODES3}}

vec3 getOffset(vec3 offset)
{
    #ifdef ZERO_BLACK
        return offset;
    #endif

    #ifdef ZERO_GREY
        return offset*2.0-1.0;
    #endif
}

float getOffset(float offset)
{
    #ifdef ZERO_BLACK
        return offset;
    #endif

    #ifdef ZERO_GREY
        return offset*2.0-1.0;
    #endif
}

void main()
{
    #ifndef MAPPING_REPEAT
        vec4 rgba=texture(displaceTex,texCoord);
    #endif
    #ifdef MAPPING_REPEAT
        vec4 rgba=texture(displaceTex,texCoord*repeat);
    #endif

    vec3 offset=rgba.rgb*rgba.a;
    float x,y;

    #ifdef INPUT_REDGREEN
        offset=getOffset(offset);
        x=offset.r*amountX+texCoord.x;
        y=offset.g*amountY+texCoord.y;
    #endif
    #ifdef INPUT_RED
        offset=getOffset(offset);
        x=offset.r*amountX+texCoord.x;
        y=offset.r*amountY+texCoord.y;
    #endif
    #ifdef INPUT_GREEN
        offset=getOffset(offset);
        x=offset.g*amountX+texCoord.x;
        y=offset.g*amountY+texCoord.y;
    #endif
    #ifdef INPUT_BLUE
        offset=getOffset(offset);
        x=offset.b*amountX+texCoord.x;
        y=offset.b*amountY+texCoord.y;
    #endif
    #ifdef INPUT_LUMINANCE
        float o=dot(vec3(0.2126,0.7152,0.0722), offset);
        o=getOffset(o);
        x=o*amountX+texCoord.x;
        y=o*amountY+texCoord.y;
    #endif
    #ifdef WRAP_CLAMP
        x=clamp(x,0.0,1.0);
        y=clamp(y,0.0,1.0);
    #endif
    #ifdef WRAP_REPEAT
        x=mod(x,1.0);
        y=mod(y,1.0);
    #endif
    #ifdef WRAP_MIRROR
        float mx=mod(x,2.0);
        float my=mod(y,2.0);
        x=abs((floor(mx)-fract(mx)));
        y=abs((floor(my)-fract(my)));
    #endif



    vec4 col=texture(tex,vec2(x,y));
    vec4 base=texture(tex,texCoord);

    base.a=0.0;

    outColor=cgl_blendPixel(base,col,amount);
}


//////