UNI sampler2D tex;
UNI float a;
UNI vec3 color;
IN vec2 texCoord;

void main()
{
    outColor=texture(tex,vec2(texCoord.x,(1.0-texCoord.y)));
}
