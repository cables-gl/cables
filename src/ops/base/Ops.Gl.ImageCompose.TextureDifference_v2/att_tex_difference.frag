
IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D tex1;
UNI sampler2D tex2;
UNI float threshold;

vec4 map(vec4 value,vec4 min1,vec4 max1,vec4 min2,vec4 max2)
{
    return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

void main()
{
    vec4 col1=texture(tex1,texCoord);
    vec4 col2=texture(tex2,texCoord);
    vec4 diff=abs(col1-col2);

    diff=map(diff,vec4(threshold),vec4(1.0),vec4(0),vec4(1.));
    diff=clamp(diff,vec4(0),vec4(1.));

    diff.a=1.0;
    outColor=diff;

}
