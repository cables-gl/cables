IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float uScaleX;
UNI float uScaleY;

{{BLENDCODE}}

void main()
{
    vec2 scale = vec2(uScaleX,uScaleY);
    vec2 uv = texCoord;
    uv = (uv - 0.5) / scale + 0.5;

    //blend section
    vec4 col = texture2D(tex,uv);
    //original texture
    vec4 base = texture2D(tex,texCoord);
    //blend stuff
    col = vec4( _blend(base.rgb,col.rgb) ,1.0);
    col = vec4( mix( col.rgb, base.rgb ,1.0 - base.a * amount),1.0);
    outColor= col;
}