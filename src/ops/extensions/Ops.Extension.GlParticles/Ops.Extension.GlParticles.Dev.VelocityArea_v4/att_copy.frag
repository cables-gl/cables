
in vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texVel;

void main()
{
    vec4 colVel=texture(texVel,texCoord);
    vec4 col=texture(tex,texCoord);

    outColor=col+colVel;
}