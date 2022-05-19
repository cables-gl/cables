IN vec2 texCoord;
UNI sampler2D tex;

void main()
{
    outColor=texture(tex,texCoord);
}
