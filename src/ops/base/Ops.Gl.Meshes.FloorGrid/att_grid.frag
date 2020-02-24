IN vec4 posColor;
IN vec3 posFrag;

void main()
{
    outColor=posColor;
    outColor.a*=(1.0-(length(posFrag)/30.0));
}