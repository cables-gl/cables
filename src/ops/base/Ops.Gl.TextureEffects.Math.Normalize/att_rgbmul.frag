IN vec2 texCoord;
UNI sampler2D tex;
UNI float fade;
UNI float mul;


void main()
{
    vec4 col=texture(tex,texCoord);

    col.xyz=(normalize(col.xyz)*mul)*fade+col.xyz*(1.0-fade);

    outColor=col;
}
