IN vec3 vPosition;
IN vec2 instTexCoord;
UNI sampler2D tex;

float lumi(vec3 color)
{
   return dot(vec3(0.2126,0.7152,0.0722), color);
}

void main()
{
    highp float strength=0.0;
    highp float pos=-0.25;
    #ifdef HISTOGRAM_R
        strength=texture(tex,instTexCoord).r;
        pos=0.75;
    #endif

    #ifdef HISTOGRAM_G
        strength=texture(tex,instTexCoord).g;
        pos=0.25;
    #endif

    #ifdef HISTOGRAM_B
        strength=texture(tex,instTexCoord).b;
        pos=-0.25;
    #endif

    #ifdef HISTOGRAM_LUMI
        strength=lumi(texture(tex,instTexCoord).rgb);
        pos=-0.75;
    #endif

    highp vec2 center=vec2(strength*2.0-1.0, pos);
    highp vec2 localOffset=vPosition.xy*vec2(1.0/256.0, 0.25);

    gl_Position=vec4(center+localOffset, 0.0, 1.0);
}
