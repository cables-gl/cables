IN vec2 texCoord;

UNI sampler2D tex;
UNI sampler2D texMask;
UNI sampler2D texOriginal;

void main()
{
    vec4 sorted = texture(tex, texCoord);
    vec4 original = texture(texOriginal, texCoord);
    outColor = mix(original, sorted, texture(texMask, texCoord).r);
}
