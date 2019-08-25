IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D patternTex;
UNI float amount;
UNI float patternWidth;
UNI float patternHeight;

{{CGL.BLENDMODES}}

float desaturate(vec3 color)
{
    vec3 gray = vec3(dot(vec3(0.2126,0.7152,0.0722), color));
    return gray.g;
}

void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);
    vec4 base=texture(tex,texCoord);

    vec2 nc=vec2(0.5,desaturate(base.rgb));
    nc.x=mod(texCoord.x,patternWidth*0.1);
    nc.y=nc.y+mod(texCoord.y,patternHeight*0.1);

    // maybe should have a ping pong modulo option...

    nc.x=clamp(nc.x,0.0,1.0);
    nc.y=clamp(nc.y,0.0,1.0);

    vec4 newCol=texture(patternTex,nc);

    outColor=cgl_blend(base,newCol,amount);
}