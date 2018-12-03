IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float amountX;
UNI float amountY;

{{BLENDCODE}}

void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);

    float x=1.0/amountX;
    float y=1.0/amountY;
    vec2 coord = vec2(x*floor(texCoord.x/x), y*floor(texCoord.y/y));

    col=texture2D(tex,coord);
    vec4 base=texture2D(tex,texCoord);

    col=vec4( _blend(base.rgb,col.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);

    outColor= col;
}