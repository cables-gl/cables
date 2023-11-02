IN vec4 frag_instColor;

#ifdef WEBGL2
    flat IN float frag_instIndex;
#endif
#ifdef WEBGL1
    IN float frag_instIndex;
#endif
