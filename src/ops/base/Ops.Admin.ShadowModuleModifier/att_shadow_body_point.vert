// VERTEX BODY type: POINT count: {{LIGHT_INDEX}}
#ifdef HAS_SHADOW_MAP
    modelPosMOD{{LIGHT_INDEX}} = mMatrix * pos;
    MOD_normal{{LIGHT_INDEX}} = norm;
#endif
