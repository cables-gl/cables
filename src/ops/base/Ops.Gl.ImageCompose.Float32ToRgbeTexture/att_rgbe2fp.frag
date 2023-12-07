UNI sampler2D tex;
IN vec2 texCoord;


// highp vec3 decodeRGBE8(highp vec4 rgbe)
// {
//     highp vec3 vDecoded = rgbe.rgb * pow(2.0, rgbe.a * 255.0-128.0);
//     return vDecoded;
// }
vec4 encodeRGBE8( vec3 rgb )
{
    vec4 vEncoded;
    float maxComponent = max(max(rgb.r, rgb.g), rgb.b );
    float fExp = ceil( log2(maxComponent) );
    vEncoded.rgb = rgb / exp2(fExp);
    vEncoded.a = (fExp + 128.0) / 255.0;
    return vEncoded;
}


void main()
{
    vec4 col=vec4( encodeRGBE8(texture(tex,texCoord).rgb));

    outColor= col;
}