// VERTEX BODY type: POINT count: {{LIGHT_INDEX}}
#ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}
    MOD_modelPos{{LIGHT_INDEX}} = mMatrix * pos;
    MOD_normal{{LIGHT_INDEX}} = norm;
#endif
