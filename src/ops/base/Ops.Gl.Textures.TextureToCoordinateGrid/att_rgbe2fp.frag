UNI sampler2D tex;
IN vec2 texCoord;
UNI float aspect;
UNI float threshold;

void main()
{
    vec4 col=texture(tex,texCoord);
    vec4 outCol=vec4(111111.0);
    outCol.a=0.0;

    if(col.r>threshold)
    {
        outCol=vec4(vec2((texCoord.x-0.5)*aspect,texCoord.y-0.5),0.0,1.0);
    }

    outColor = outCol;
}