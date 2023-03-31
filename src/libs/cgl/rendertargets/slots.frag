
    #ifdef INSTANCING
        float instIdx=frag_instIndex;
    #endif
    #ifndef INSTANCING
        float instIdx=0.0;
    #endif
