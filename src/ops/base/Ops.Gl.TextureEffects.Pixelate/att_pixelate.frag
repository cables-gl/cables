IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D multiplierTex;
UNI float amount;
UNI float amountX;
UNI float amountY;

{{CGL.BLENDMODES}}

void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);

    float x=1.0/amountX;
    float y=1.0/amountY;

    #ifdef PIXELATE_TEXTURE
    x -= texture(multiplierTex,texCoord).r*0.1;//*0.1
    y -= texture(multiplierTex,texCoord).r*0.1;//*0.1
    #endif

    vec2 coord = vec2(x*floor(texCoord.x/x), y*floor(texCoord.y/y));

    col=texture(tex,coord);
    vec4 base=texture(tex,texCoord);

    outColor=cgl_blend(base,col,amount);
}