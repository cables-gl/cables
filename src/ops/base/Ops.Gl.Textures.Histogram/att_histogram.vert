IN vec3 vPosition;
IN vec2 attrTexCoord;
UNI sampler2D tex;

float lumi(vec3 color)
{
   return dot(vec3(0.2126,0.7152,0.0722), color);
}

void main()
{
    vec2 tc=attrTexCoord;

    float strength;
    highp float pos=0.0;
    #ifdef HISTOGRAM_R
        strength=texture(tex,tc).r;
        pos=0.0;
    #endif

    #ifdef HISTOGRAM_G
        strength=texture(tex,tc).g;
        pos=0.25;
    #endif

    #ifdef HISTOGRAM_B
        strength=texture(tex,tc).b;
        pos=0.5;
    #endif

    #ifdef HISTOGRAM_LUMI
        strength=lumi(texture(tex,tc).rgb);
        pos=0.75;
    #endif

    gl_PointSize=0.8;

    vec4 model= vec4(strength*2.0-1.0, pos , 0.0,1.0);

    gl_Position= model;
}
