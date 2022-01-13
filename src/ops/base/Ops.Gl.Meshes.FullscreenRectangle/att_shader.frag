UNI sampler2D tex;
IN vec2 texCoord;

void main()
{

    vec2 tc=vec2(texCoord.x,(1.0-texCoord.y));

   outColor= texture(tex,tc);
}
