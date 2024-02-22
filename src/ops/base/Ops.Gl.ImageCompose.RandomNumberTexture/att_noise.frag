IN vec2 texCoord;
UNI sampler2D tex;
UNI float amount;
UNI float seed;

UNI vec2 r,g,b,a;

#ifdef HAS_MULMASK
    UNI sampler2D texMul;
#endif

{{CGL.BLENDMODES3}}
{{MODULES_HEAD}}

{{CGL.RANDOM_TEX}}

void main()
{
    vec4 base=texture(tex,texCoord);
    vec4 col;

    col=vec4(
        r.x + cgl_random(texCoord.xy*1.02323 + vec2(mod(seed,100.0))) * (r.y - r.x),
        g.x + cgl_random(texCoord.xy*3.23230 + vec2(mod(seed,100.0))) * (g.y - g.x),
        b.x + cgl_random(texCoord.xy*5.57118 + vec2(mod(seed,100.0))) * (b.y - b.x),
        a.x + cgl_random(texCoord.xy*6.45329 + vec2(mod(seed,100.0))) * (a.y - a.x)
        );


    #ifdef HAS_MULMASK
        col.rgb*=texture(texMul,texCoord).rgb;
    #endif

    outColor=cgl_blendPixel(base,col,amount);
}