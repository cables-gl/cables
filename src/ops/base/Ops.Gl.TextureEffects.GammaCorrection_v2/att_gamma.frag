IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float multiplyAmount;
UNI float gammaAmount;

{{CGL.BLENDMODES}}

void main()
{
    vec4 base4=texture(tex,texCoord);
    vec3 color = base4.rgb * multiplyAmount;

    outColor= vec4(
            mix(
                color,
                vec3(pow(color,vec3(1.0 / gammaAmount))
            ),amount),
            base4.a);
}