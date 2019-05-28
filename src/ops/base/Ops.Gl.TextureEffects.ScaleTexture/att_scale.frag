IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float uScaleX,uScaleY;
UNI float offsetX,offsetY;
UNI float centerX,centerY;

{{CGL.BLENDMODES}}

void main()
{
    vec2 uv = texCoord;

    uv.x = (uv.x - centerX) / uScaleX + centerX+offsetX;
    uv.y = (uv.y - centerY) / uScaleY +centerY+offsetY;

    //blend section
    vec4 col = texture(tex,uv);
    //original texture
    vec4 base = texture(tex,texCoord);

    outColor= col;
}