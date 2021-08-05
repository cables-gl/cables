IN vec2 texCoord;
UNI sampler2D tex;

UNI float modX;
UNI float modY;
UNI float modZ;

void main()
{
    vec4 col=texture(tex,texCoord);

col.xyz=normalize(col.xyz);

   outColor= col;
}
