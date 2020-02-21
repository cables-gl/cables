#ifdef COLORIZE_INSTANCES
    #ifdef BLEND_MODE_MULTIPLY
        col.rgb *= frag_instColor.rgb;
    #endif

    #ifdef BLEND_MODE_ADD
        col.rgb += frag_instColor.rgb;
    #endif

    #ifdef BLEND_MODE_NONE
        col.rgb = frag_instColor.rgb;
    #endif

    col.a = frag_instColor.a;
#endif
