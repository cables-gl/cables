IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D displaceTex;
UNI float amountX;
UNI float amountY;

void main()
{
    vec3 offset=texture2D(displaceTex,texCoord).rgb;
    float x,y;

    #ifdef INPUT_REDGREEN
        offset=offset*2.0-1.0;
        x=offset.r*amountX+texCoord.x;
        y=offset.g*amountY+texCoord.y;
    #endif

    #ifdef INPUT_RED
        offset=offset*2.0-1.0;
        x=offset.r*amountX+texCoord.x;
        y=offset.r*amountY+texCoord.y;
    #endif

    #ifdef INPUT_GREEN
        offset=offset*2.0-1.0;
        x=offset.g*amountX+texCoord.x;
        y=offset.g*amountY+texCoord.y;
    #endif

    #ifdef INPUT_BLUE
        offset=offset*2.0-1.0;
        x=offset.b*amountX+texCoord.x;
        y=offset.b*amountY+texCoord.y;
    #endif

    #ifdef INPUT_LUMINANCE
        float o=dot(vec3(0.2126,0.7152,0.0722), offset);
        o=o*2.0-1.0;
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

    vec4 col=texture2D(tex,vec2(x,y) );

   outColor= col;
}