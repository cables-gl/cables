
float MOD_offset=0.0;

#ifdef MOD_ANIN_SIN
    #ifdef MOD_ANIN_SIN_TCX
        MOD_offset=sin((texCoord.x)*MOD_freq+MOD_time)*(MOD_ampl/1000.0);
    #endif
    #ifdef MOD_ANIN_SIN_TCY
        MOD_offset=sin((texCoord.y)*MOD_freq+MOD_time)*(MOD_ampl/1000.0);
    #endif
#endif

#ifdef MOD_AXIS_X
    if(texCoord.x+MOD_offset>=MOD_treshhold)discard;
#endif
#ifdef MOD_AXIS_Y
    if(texCoord.y+MOD_offset>=MOD_treshhold)discard;
#endif
#ifdef MOD_AXIS_XY
    if((texCoord.y+texCoord.x)/2.0+MOD_offset>=MOD_treshhold)discard;
#endif
#ifdef MOD_AXIS_X_INV
    if(1.0-texCoord.x+MOD_offset>=MOD_treshhold)discard;
#endif
#ifdef MOD_AXIS_Y_INV
    if(1.0-texCoord.y+MOD_offset>=MOD_treshhold)discard;
#endif
#ifdef MOD_AXIS_XY_INV
    if(1.0-((texCoord.y+texCoord.x)/2.0)+MOD_offset>=MOD_treshhold)discard;
#endif


