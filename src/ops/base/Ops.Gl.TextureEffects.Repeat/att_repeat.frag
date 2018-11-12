IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float amountX;
UNI float amountY;

{{BLENDCODE}}

void main()
{
   vec2 coord = vec2(
            mod(texCoord.x*amountX,1.0),
            mod(texCoord.y*amountY,1.0));

    //blend section
    vec4 col=texture2D(tex,coord);
    //original texture
    vec4 base=texture2D(tex,texCoord);
    //blend stuff
    col=vec4( _blend(base.rgb,col.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);
    outColor= col;
}