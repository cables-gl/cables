#ifdef BLEND_MODE_MULTIPLY
    col.xyz *= frag_instColor.xyz;
#endif

#ifdef BLEND_MODE_ADD
    col.xyz += frag_instColor.xyz;
#endif

col.a = frag_instColor.a;