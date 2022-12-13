IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D srcTex;
UNI float amount;

UNI vec2 pixelPos;

{{CGL.BLENDMODES3}}

void main()
{

    vec4 base=texture(tex,texCoord);
    vec4 col=texture(srcTex,pixelPos);

    outColor=cgl_blendPixel(base,col,amount);
    outColor=col;
}