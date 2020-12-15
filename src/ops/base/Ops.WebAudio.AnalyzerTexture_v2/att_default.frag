IN vec2 texCoord;

UNI sampler2D texFFT;
UNI float width;

void main()
{
   outColor = texture(texFFT, texCoord);
}