IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float amountbright;

void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);
    col=texture(tex,texCoord);

    // apply contrast
    col.rgb = ((col.rgb - 0.5) * max(amount*2.0, 0.0))+0.5;

    // apply brightness
    col.rgb *= amountbright*2.0;

    outColor = col;
}