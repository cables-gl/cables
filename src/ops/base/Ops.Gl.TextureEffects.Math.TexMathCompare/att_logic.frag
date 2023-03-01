IN vec2 texCoord;
UNI sampler2D tex;
UNI float fade;
UNI float val;


void main()
{
    vec4 old=texture(tex,texCoord);

    vec4 col=vec4(0.,0.,0.,1.);
    vec4 valTrue=vec4(1.0);

    #ifdef PASSVALUE
        valTrue=old;
    #endif

    #ifdef MOD_CHAN_R
        #ifdef COMP_GR
            if(old.r>val)col.r=valTrue.r;
        #endif
        #ifdef COMP_SM
            if(old.r<val)col.r=valTrue.r;
        #endif
        #ifdef COMP_EQ
            if(old.r==val)col.r=valTrue.r;
        #endif
    #endif

    #ifdef MOD_CHAN_G
        #ifdef COMP_GR
            if(old.g>val)col.g=valTrue.g;
        #endif
        #ifdef COMP_SM
            if(old.g<val)col.g=valTrue.g;
        #endif
        #ifdef COMP_EQ
            if(old.g==val)col.g=valTrue.g;
        #endif
    #endif

    #ifdef MOD_CHAN_B
        #ifdef COMP_GR
            if(old.b>val)col.b=valTrue.b;
        #endif
        #ifdef COMP_SM
            if(old.b<val)col.b=valTrue.b;
        #endif
        #ifdef COMP_EQ
            if(old.b==val)col.b=valTrue.b;
        #endif
    #endif

    outColor=col;
}
