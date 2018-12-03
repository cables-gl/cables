IN vec2 texCoord;
UNI sampler2D tex;
UNI float inMin;
UNI float inMax;
UNI float midPoint;
UNI float outMax;
UNI float outMin;

void main()
{
   vec4 base=texture2D(tex,texCoord);

   vec4 inputRange = min(max(base - vec4(inMin), vec4(0.0)) / (vec4(inMax) - vec4(inMin)), vec4(outMax));
   inputRange = pow(inputRange, vec4(1.0 / (1.5 - midPoint)));

   outColor= mix(vec4(outMin), vec4(1.0), inputRange);

}