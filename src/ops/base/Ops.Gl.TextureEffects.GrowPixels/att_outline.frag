IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float strength;
UNI float texWidth,texHeight;
UNI float r,g,b;
const vec4 lumcoeff = vec4(0.299,0.587,0.114, 0.);

{{CGL.BLENDMODES}}

vec3 desaturate(vec3 color)
{
    return vec3(dot(vec3(0.2126,0.7152,0.0722), color));
}

void main()
{
    float pixelX=1.0/texWidth*0.5;
    float pixelY=1.0/texHeight*0.5;

    float n=texture( tex, vec2( texCoord.x , texCoord.y -pixelY ) ).r;
    float s=texture( tex, vec2( texCoord.x , texCoord.y +pixelY ) ).r;

    float e=texture( tex, vec2( texCoord.x+pixelX , texCoord.y ) ).r;
    float w=texture( tex, vec2( texCoord.x-pixelX , texCoord.y ) ).r;

    float c=0.0;
    if(n+s+e+w/4.0>((1.0-strength)*0.4)) c=1.0;

    vec4 col=vec4(r*c,g*c,b*c,1.0);
    vec4 base=texture(tex,texCoord);

    outColor=cgl_blend(base,col,amount);
}

