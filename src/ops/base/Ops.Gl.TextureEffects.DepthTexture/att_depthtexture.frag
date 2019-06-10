IN vec2 texCoord;
UNI float amount;
UNI sampler2D texDepth;
UNI sampler2D texBase;
UNI float n;
UNI float f;

{{CGL.BLENDMODES}}

void main()
{
    vec4 col=texture(texDepth,texCoord);
    float z=col.r;
    float c=(2.0*n)/(f+n-z*(f-n));

    #ifdef INVERT
       c=1.0-c;
    #endif

    col=vec4(c,c,c,1.0);
    vec4 base=texture(texBase,texCoord);

    outColor=cgl_blend(base,col,amount);

}