IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D mulTex;
UNI float amount;
UNI float amountX;
UNI float amountY;

{{CGL.BLENDMODES3}}

void main()
{
    float am=amount;

    float mul=1.0;

    #ifdef HAS_MASK
        mul=texture(mulTex,texCoord).r;
    #endif

    vec2 coord = vec2(
        mod(texCoord.x*amountX*mul,1.0),
        mod(texCoord.y*amountY*mul,1.0));

    vec4 col=texture(tex,coord);
    vec4 base=texture(tex,texCoord);


    #ifdef CLEAR
        base.a=0.0;
    #endif

    outColor=cgl_blendPixel(base,col,am);
}