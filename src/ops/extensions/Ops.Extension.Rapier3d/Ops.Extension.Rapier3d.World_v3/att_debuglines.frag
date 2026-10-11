IN vec4 vertColor;
UNI float opacity;

void main()
{
    outColor = vec4(vertColor.rgb, vertColor.a * opacity);
}
