IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float amountX;
UNI float amountY;

{{CGL.BLENDMODES}}

void main()
{
   vec2 coord = vec2(
        mod(texCoord.x*amountX,1.0),
        mod(texCoord.y*amountY,1.0));

    vec4 col=texture(tex,coord);
    vec4 base=texture(tex,texCoord);

    outColor=cgl_blend(base,col,amount);
}