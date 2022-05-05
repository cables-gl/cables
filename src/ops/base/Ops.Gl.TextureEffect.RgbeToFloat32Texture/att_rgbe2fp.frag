UNI sampler2D  tex;
IN vec2 texCoord;


vec3 decodeRGBE8(vec4 rgbe)
{
    vec3 vDecoded = rgbe.rgb * pow(2.0, rgbe.a * 255.0-128.0);
    return vDecoded;
}

void main()
{
    highp vec4 col=vec4(
        decodeRGBE8(
            texture(tex,texCoord)
        ), 1.0);


    outColor= col;
}