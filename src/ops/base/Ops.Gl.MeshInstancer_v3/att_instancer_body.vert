#ifdef INSTANCING
    mMatrix*=instMat;
    /*#ifdef HAS_NORMAL_MATRIX
        NORMAL_MATRIX*=instMat;
    #endif*/
    pos.xyz*=MOD_scale;
    frag_instColor = instColor;
#endif