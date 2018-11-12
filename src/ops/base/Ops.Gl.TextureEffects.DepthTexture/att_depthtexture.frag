IN vec2 texCoord;
UNI float amount;
UNI sampler2D texDepth;
UNI sampler2D texBase;
UNI float n;
UNI float f;

{{BLENDCODE}}

void main()
{
    vec4 col=texture2D(texDepth,texCoord);
    float z=col.r;
    float c=(2.0*n)/(f+n-z*(f-n));

    #ifdef INVERT
       c=1.0-c;
    #endif

    col=vec4(c,c,c,1.0);
    vec4 base=texture2D(texBase,texCoord);
    //blend stuff
    col=vec4( _blend(base.rgb,col.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);
    outColor= col;
}