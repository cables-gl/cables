IN vec2 texCoord;
UNI sampler2D tex;
UNI float fade;


void main()
{
    vec4 col=texture(tex,texCoord);

col.xyz=normalize(col.xyz)*fade + (col.xyz*(1.0-fade));

   outColor= col;
}
