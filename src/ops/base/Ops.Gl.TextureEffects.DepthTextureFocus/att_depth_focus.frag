IN vec2 texCoord;
UNI sampler2D image;
UNI float n;
UNI float f;
UNI float focus;
UNI float width;

void main()
{
    vec4 col=texture(image,texCoord);
    float z=col.r;
    float c=(2.0*n)/(f+n-z*(f-n));

    c=abs( c-focus );
    c=smoothstep(0.0,width,c);

    #ifndef INVERT
        c=1.0-c;
    #endif

    outColor = vec4(c,c,c,1.0);
}