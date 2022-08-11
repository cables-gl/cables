UNI sampler2D tex;
IN vec2 texCoord;

void main()
{
    outColor= texture(tex,texCoord);
}

