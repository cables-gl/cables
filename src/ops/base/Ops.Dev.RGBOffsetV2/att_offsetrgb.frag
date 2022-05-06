IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float offsetRedX,offsetRedY,offsetGreenX,offsetGreenY,offsetBlueX,offsetBlueY;
UNI float redAmount,greenAmount,blueAmount;

{{CGL.BLENDMODES3}}

void main()
{
    vec3 rgb = vec3(texture(tex,texCoord+vec2(offsetRedX,offsetRedY)).r,
                    texture(tex,texCoord+vec2(offsetGreenX,offsetGreenY)).g,
                    texture(tex,texCoord+vec2(offsetBlueX,offsetBlueY)).b);

    vec4 base = texture(tex,texCoord);
    vec4 col = vec4(rgb*vec3(redAmount,greenAmount,blueAmount),base.a);

    outColor=cgl_blendPixel(base,col,amount);
}
