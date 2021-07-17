IN vec2 texCoord;
UNI sampler2D tex;
UNI sampler2D tex2;
UNI float r;
UNI float g;
UNI float b;
UNI float a;

void main()
{
    vec4 col=texture(tex,texCoord);
    vec4 v=vec4(r,g,b,a);

    #ifdef MOD_USE_TEX
        v=texture(tex2,texCoord);
    #endif


    #ifdef MOD_OP_SUB_CX
        #ifdef MOD_CHAN_R
            col.r=col.r-v.r;
        #endif
        #ifdef MOD_CHAN_G
            col.g=col.g-v.g;
        #endif
        #ifdef MOD_CHAN_B
            col.b=col.b-v.b;
        #endif
        #ifdef MOD_CHAN_A
            col.a=col.a-v.a;
        #endif
    #endif

    #ifdef MOD_OP_SUB_XC
        #ifdef MOD_CHAN_R
            col.r=v.r-col.r;
        #endif
        #ifdef MOD_CHAN_G
            col.g=v.g-col.g;
        #endif
        #ifdef MOD_CHAN_B
            col.b=v.b-col.b;
        #endif
        #ifdef MOD_CHAN_A
            col.a=v.a-col.a;
        #endif
    #endif

    #ifdef MOD_OP_ADD
        #ifdef MOD_CHAN_R
            col.r+=v.r;
        #endif
        #ifdef MOD_CHAN_G
            col.g+=v.g;
        #endif
        #ifdef MOD_CHAN_B
            col.b+=v.b;
        #endif
        #ifdef MOD_CHAN_A
            col.a+=v.a;
        #endif
    #endif

    #ifdef MOD_OP_MUL
        #ifdef MOD_CHAN_R
            col.r*=v.r;
        #endif
        #ifdef MOD_CHAN_G
            col.g*=v.g;
        #endif
        #ifdef MOD_CHAN_B
            col.b*=v.b;
        #endif
        #ifdef MOD_CHAN_A
            col.a*=v.a;
        #endif
    #endif

    #ifdef MOD_OP_DIV_XC
        #ifdef MOD_CHAN_R
            col.r=v.r/col.r;
        #endif
        #ifdef MOD_CHAN_G
            col.g=v.g/col.g;
        #endif
        #ifdef MOD_CHAN_B
            col.b=v.b/col.b;
        #endif
        #ifdef MOD_CHAN_A
            col.a=v.a/col.a;
        #endif
    #endif

    #ifdef MOD_OP_DIV_CX
        #ifdef MOD_CHAN_R
            col.r=col.r/v.r;
        #endif
        #ifdef MOD_CHAN_G
            col.g=col.g/v.g;
        #endif
        #ifdef MOD_CHAN_B
            col.b=col.b/v.b;
        #endif
        #ifdef MOD_CHAN_A
            col.a=col.a/v.a;
        #endif
    #endif

    #ifdef MOD_OP_MODULO
        col=mod(col,v);
    #endif


   outColor= col;
}
