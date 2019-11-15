#ifdef INSTANCING
    mMatrix*=instMat;
    pos.xyz*=MOD_scale;
    frag_instColor = instColor;
#endif
