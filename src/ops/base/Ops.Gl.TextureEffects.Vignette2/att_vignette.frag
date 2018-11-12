IN vec2 texCoord;
UNI sampler2D tex;
UNI float lensRadius1;
UNI float aspect;
UNI float amount;
UNI float strength;
UNI float sharp;

UNI float r,g,b;

{{BLENDCODE}}

void main()
{
    vec4 vcol=vec4(r,g,b,1.0);
    vec4 col=texture2D(tex,texCoord);
    vec2 tcPos=vec2(texCoord.x,(texCoord.y-0.5)*aspect+0.5);
    float dist = distance(tcPos, vec2(0.5,0.5));
    float am = (1.0-smoothstep( (lensRadius1+0.5), (lensRadius1*0.99+0.5)*sharp, dist));

    col=mix(col,vcol,am*strength);
    vec4 base=texture2D(tex,texCoord);

    col=vec4( _blend(base.rgb,col.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);
    outColor= col;
}
