IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float multiplyAmount;
UNI float gammaAmount;

{{CGL.BLENDMODES}}

void main()
{
    vec3 color = texture(tex,texCoord).rgb * multiplyAmount;
    outColor= mix(vec4(color,1.0),
                vec4(pow(color,vec3(1.0 / gammaAmount)),1.0),amount);
}