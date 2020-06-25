// VERTEX BODY type: SPOT count: {{LIGHT_INDEX}}
#ifdef HAS_SHADOW_MAP
    modelPosMOD{{LIGHT_INDEX}} = mMatrix*pos;
    shadowCoord{{LIGHT_INDEX}} = MOD_lightMatrix{{LIGHT_INDEX}} * (modelPosMOD{{LIGHT_INDEX}} + vec4(norm, 1) * MOD_normalOffset{{LIGHT_INDEX}});
    MOD_normal{{LIGHT_INDEX}} = norm;
#endif