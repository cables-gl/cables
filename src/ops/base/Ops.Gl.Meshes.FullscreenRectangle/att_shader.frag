
UNI sampler2D tex;
IN vec2 texCoord;

void main()
{
   outColor= texture2D(tex,vec2(texCoord.x,(1.0-texCoord.y)));
}
