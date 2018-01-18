

#ifdef MOD_AXIS_X
    if(texCoord.x>=MOD_treshhold)discard;
#endif

#ifdef MOD_AXIS_Y
    if(texCoord.y>=MOD_treshhold)discard;
#endif
