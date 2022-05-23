IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float strength;
UNI float texWidth,texHeight;
UNI float r,g,b;
const vec4 lumcoeff = vec4(0.299,0.587,0.114, 0.);

{{CGL.BLENDMODES3}}

vec3 desaturate(vec3 color)
{
    return vec3(dot(vec3(0.2126,0.7152,0.0722), color));
}

void main()
{
    float pixelX=1.0/texWidth*0.5;
    float pixelY=1.0/texHeight*0.5;

    vec4 co = texture(tex, vec2(texCoord.x, texCoord.y - pixelY ));
    float n=co.r*co.a;
    co = texture(tex, vec2(texCoord.x, texCoord.y + pixelY ));
    float s=co.r*co.a;

    co = texture(tex, vec2(texCoord.x+pixelX, texCoord.y ));
    float e=co.r*co.a;
    co = texture(tex, vec2(texCoord.x-pixelX, texCoord.y ));
    float w=co.r*co.a;

    float c=0.0;
    if(n+s+e+w/4.0>((1.0-strength)*0.4)) c=1.0;

    vec4 base=texture(tex,texCoord);
    vec4 col=vec4(r*c,g*c,b*c,base.a+c);

    outColor=cgl_blendPixel(base,col,amount);
}

