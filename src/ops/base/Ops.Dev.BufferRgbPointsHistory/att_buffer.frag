
UNI sampler2D texCoords;
UNI sampler2D texOld;
UNI sampler2D texRandoms;
IN vec2 texCoord;

UNI float column;
UNI float width;

void main()
{

    vec4 col =texture(texOld,texCoord);

    if(column>=floor(texCoord.x*width) && column<=ceil(texCoord.x*width)+2.0)
    {
        // col=vec4(1., 0., 0., 1.0);
        vec4 theTexCoords = texture(texRandoms, vec2(texCoord.x,texCoord.y));

        col=texture(texCoords,theTexCoords.xy);
    }

    outColor= col;
}