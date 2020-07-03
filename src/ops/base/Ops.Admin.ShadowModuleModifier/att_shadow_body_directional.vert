// VERTEX BODY type: DIRECTIONAL count: {{LIGHT_INDEX}}
#ifdef RECEIVE_SHADOW
    #ifdef HAS_SHADOW_MAP
        MOD_modelPos{{LIGHT_INDEX}} = mMatrix*pos;
        shadowCoord{{LIGHT_INDEX}} = MOD_lightMatrix{{LIGHT_INDEX}} * (MOD_modelPos{{LIGHT_INDEX}} + vec4(norm, 1) * MOD_normalOffset{{LIGHT_INDEX}});
    #endif
#endif
