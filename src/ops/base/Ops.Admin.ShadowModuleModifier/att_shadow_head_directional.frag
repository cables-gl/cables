// FRAGMENT HEAD type: SPOT count: {{LIGHT_INDEX}}
//UNI ModLight MOD_light{{LIGHT_INDEX}};

#ifdef RECEIVE_SHADOW
    #ifdef HAS_SHADOW_MAP
        IN vec4 modelPosMOD{{LIGHT_INDEX}};
        IN vec4 shadowCoord{{LIGHT_INDEX}};
    #endif
    //UNI sampler2D shadowMap{{LIGHT_INDEX}};
#endif
