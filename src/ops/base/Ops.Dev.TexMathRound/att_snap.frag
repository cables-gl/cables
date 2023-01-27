IN vec2 texCoord;
UNI sampler2D tex;
UNI float mul;
UNI float amount;

{{CGL.BLENDMODES}}

void main()
{
    vec4 col=vec4(1.0,0.0,0.0,1.0);
    vec4 orig=texture(tex,texCoord);
    col=orig;

    #ifdef CHAN_R
        col.r=round(orig.r*mul)/mul;
    #endif
    #ifdef CHAN_G
        col.g=round(orig.g*mul)/mul;
    #endif
    #ifdef CHAN_B
        col.b=round(orig.b*mul)/mul;
    #endif
    #ifdef CHAN_A
        col.a=round(orig.a*mul)/mul;
    #endif

    outColor=col*amount+orig*(1.0-amount);

}
