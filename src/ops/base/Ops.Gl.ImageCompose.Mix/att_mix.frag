IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D tex1;
UNI sampler2D tex2;
UNI float fade;

void main()
{
    vec4 col=texture(tex,texCoord);
    vec4 col1=texture(tex1,texCoord);
    vec4 col2=texture(tex2,texCoord);

    col=mix(col1,col2,fade);

    outColor= col;
}
