
in vec2 texCoord;
UNI sampler2D texA;
UNI sampler2D texB;

void main()
{
    vec4 a=texture(texA,texCoord);
    vec4 b=texture(texB,texCoord);

    // outColor=(a*0.1)+(b*0.9);
    // outColor=b;
    outColor=mix(a,b,0.8);
}
