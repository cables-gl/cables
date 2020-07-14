// VERTEX HEAD type: DIRECTIONAL count: {{LIGHT_INDEX}}
#ifdef RECEIVE_SHADOW
    #ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}
        OUT vec4 MOD_modelPos{{LIGHT_INDEX}};
        OUT vec4 MOD_shadowCoord{{LIGHT_INDEX}};
    #endif
#endif
