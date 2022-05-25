IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D texMask;
UNI float time;
UNI float speedX;
UNI float speedY;
UNI float repeatX;
UNI float repeatY;
UNI float mul;

{{CGL.LUMINANCE}}

void main()
{
    float mult=1.0;
    #ifdef HAS_MASK
        #ifdef MASK_SRC_R
            mult*=texture(texMask,texCoord).r;
        #endif
        #ifdef MASK_SRC_G
            mult*=texture(texMask,texCoord).g;
        #endif
        #ifdef MASK_SRC_B
            mult*=texture(texMask,texCoord).b;
        #endif
        #ifdef MASK_SRC_A
            mult*=texture(texMask,texCoord).a;
        #endif
        #ifdef MASK_SRC_LUM
            mult*=cgl_luminance(texture(texMask,texCoord).rgb);
        #endif
        #ifdef MASK_INV
            mult=1.0-mult;
        #endif
    #endif

    mult*=mul;

    vec2 tc = texCoord + cos( (time*vec2(speedX, speedY) + vec2(texCoord.s*repeatX,texCoord.t*repeatY)))*mult;
    vec4 col=texture(tex,tc);

    outColor= col;
}