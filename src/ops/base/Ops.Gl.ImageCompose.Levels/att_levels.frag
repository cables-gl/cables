IN vec2 texCoord;
UNI sampler2D tex;
UNI float inMin;
UNI float inMax;
UNI float midPoint;
UNI float outMax;
UNI float outMin;

void main()
{
    vec3 base=texture(tex,texCoord).rgb;
    vec3 inputRange = min(max(base - vec3(inMin), vec3(0.0)) / (vec3(inMax) - vec3(inMin)), vec3(outMax));

    inputRange = pow(inputRange, vec3(1.0 / (1.5 - midPoint)));

    outColor.a=1.0;
    outColor.rgb= mix(vec3(outMin), vec3(1.0), inputRange);
}