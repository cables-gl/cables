IN vec2 texCoord;
UNI sampler2D tex;
UNI float lineSize;
UNI float amount;

{{BLENDCODE}}

void main()
{

    float total = floor(texCoord.x*lineSize-lineSize/2.0) +floor(texCoord.y*lineSize-lineSize/2.0);
    float r = mod(total,2.0);

    //vec4 col=vec4(r,r,r,1.0);

    //blend section
    vec4 col=vec4(r,r,r,1.0);
    //original texture
    vec4 base=texture2D(tex,texCoord);
    //blend stuff
    col=vec4( _blend(base.rgb,col.rgb) ,1.0);
    col=vec4( mix( col.rgb, base.rgb ,1.0-base.a*amount),1.0);
    outColor= col;
}