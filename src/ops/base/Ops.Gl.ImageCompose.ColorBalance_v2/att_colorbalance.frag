IN vec2 texCoord;
UNI sampler2D tex;
UNI float r;
UNI float g;
UNI float b;

float lumi(vec3 color)
{
    return vec3(dot(vec3(0.2126,0.7152,0.0722), color)).r;
}

void main()
{
    vec4 base=texture(tex,texCoord);
    float l=lumi(base.rgb);

    #ifdef TONE_MID
        l=smoothstep(0.33,0.66,l);
    #endif

    #ifdef TONE_LOW
        l=1.0-l;
    #endif

    l=l*l;
    vec3 color=base.rgb+vec3(l*r*0.1,l*g*0.1,l*b*0.1);
    outColor= vec4(color,base.a);
}
