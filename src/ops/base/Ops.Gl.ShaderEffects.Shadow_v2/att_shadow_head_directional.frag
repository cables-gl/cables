// FRAGMENT HEAD type: SPOT count: {{LIGHT_INDEX}}

#ifdef RECEIVE_SHADOW
    #ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}
        IN vec4 MOD_modelPos{{LIGHT_INDEX}};
        IN vec4 MOD_shadowCoord{{LIGHT_INDEX}};
    #endif
#endif
