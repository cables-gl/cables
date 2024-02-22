UNI sampler2D tex;
IN vec2 texCoord;
UNI float aspect;
UNI float threshold;
UNI float repeatsY;
UNI float repeatsSpace;

void main()
{
    vec4 col=texture(tex,vec2(texCoord.x,mod(texCoord.y*repeatsY,1.0)));
    vec4 outCol=vec4(vec3(9999999.0),0.0);

    if(col.r>threshold)
    {
        outCol=vec4(
            vec2(
                (texCoord.x-0.5)*aspect,
                mod(texCoord.y*repeatsY,1.0)-0.5),
                (floor(texCoord.y*repeatsY)-(repeatsY-1.0)/2.0)*repeatsSpace,
                1.0);
    }

    outColor = outCol;
}
