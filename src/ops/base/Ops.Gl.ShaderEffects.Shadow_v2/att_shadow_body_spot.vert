// VERTEX BODY type: SPOT count: {{LIGHT_INDEX}}
#ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}
    MOD_modelPos{{LIGHT_INDEX}} = mMatrix*pos;
    MOD_shadowCoord{{LIGHT_INDEX}} = MOD_lightMatrix{{LIGHT_INDEX}} * (MOD_modelPos{{LIGHT_INDEX}} + vec4(norm, 1) * MOD_normalOffset{{LIGHT_INDEX}});
    MOD_normal{{LIGHT_INDEX}} = norm;
#endif
