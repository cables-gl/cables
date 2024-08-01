
in vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texA;

void main()
{
    vec4 a=texture(texA,texCoord);
    vec4 b=texture(tex,texCoord);

    // outColor=(a*0.1)+(b*0.9);
    // outColor=b;
    // outColor=vec4(mix(a.rgb,b.rgb,0.5),1.0);

    // outColor=vec4(0.0,1.0,0.0,1.0);
    // outColor=vec4(a.rgb*0.1,1.0);

    // outColor=a;
    outColor=b;
}
