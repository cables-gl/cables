UNI sampler2D tex;
IN vec2 texCoord;


highp vec3 decodeRGBE8(highp vec4 rgbe)
{
    highp vec3 vDecoded = rgbe.rgb * pow(2.0, rgbe.a * 255.0-128.0);
    return vDecoded;
}

void main()
{
    vec4 col=vec4(
        decodeRGBE8(
            texture(tex,texCoord)
        ), 1.0);


    outColor= col;
}