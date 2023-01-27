IN vec2 texCoord;
UNI sampler2D tex;
UNI float mul;

{{CGL.BLENDMODES}}

void main()
{
   vec4 col=vec4(1.0,0.0,0.0,1.0);
   col=texture(tex,texCoord);

    #ifdef CHAN_R
        col.r=round(col.r*mul)/mul;
    #endif
    #ifdef CHAN_G
        col.g=round(col.g*mul)/mul;
    #endif
    #ifdef CHAN_B
        col.b=round(col.b*mul)/mul;
    #endif
    #ifdef CHAN_A
        col.a=round(col.a*mul)/mul;
    #endif

    outColor=col;

}
