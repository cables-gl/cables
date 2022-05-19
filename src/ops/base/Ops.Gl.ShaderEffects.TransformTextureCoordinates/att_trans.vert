
#ifdef MOD_FLIPX
    texCoord.x=1.0-texCoord.x;
#endif
#ifdef MOD_FLIPY
    texCoord.y=1.0-texCoord.y;
#endif

texCoord*=MOD_scale;
texCoord+=MOD_trans;