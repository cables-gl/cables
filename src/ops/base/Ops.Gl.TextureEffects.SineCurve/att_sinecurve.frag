
IN vec2 texCoord;
UNI sampler2D tex;

UNI float offset;
UNI float frequency;
UNI float amplitude;

#define M_PI2 1.5707963267948966
#define M_PI 3.1415926535897932384626433832795

void main()
{
    vec4 col=texture2D(tex,texCoord);

    float s=sin((texCoord.x*M_PI*frequency)+offset)+1.0;
    s*=amplitude;
    s/=2.0;
    
    #ifdef FLIP
        if(texCoord.y>s) s=1.0;
            else s=0.0;
    #endif

    #ifndef FLIP
        if(texCoord.y<s) s=1.0;
            else s=0.0;
    #endif


    col*=vec4(s,s,s,1.0);

    gl_FragColor=col;
}
