
in vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texA;
UNI float velDrag;

void main()
{
    vec4 a=texture(texA,texCoord);
    vec4 b=texture(tex,texCoord);

    outColor=vec4(a*(1.0-velDrag)+b*velDrag);
}
