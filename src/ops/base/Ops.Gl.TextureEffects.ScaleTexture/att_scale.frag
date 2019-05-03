IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float uScaleX,uScaleY;
UNI float offsetX,offsetY;
UNI float centerX,centerY;

{{BLENDCODE}}

void main()
{
    vec2 uv = texCoord;

    uv.x = (uv.x - centerX) / uScaleX + centerX+offsetX;
    uv.y = (uv.y - centerY) / uScaleY +centerY+offsetY;

    //blend section
    vec4 col = texture2D(tex,uv);
    //original texture
    vec4 base = texture2D(tex,texCoord);
    //blend stuff
    col = vec4( _blend(base.rgb,col.rgb) ,1.0);
    col = vec4( mix( col.rgb, base.rgb ,1.0 - base.a * amount),1.0);
    outColor= col;
}