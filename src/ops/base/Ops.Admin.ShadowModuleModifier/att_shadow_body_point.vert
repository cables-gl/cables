// VERTEX BODY type: POINT count: {{LIGHT_INDEX}}
#ifdef SHADOW_MAP
    modelPosMOD{{LIGHT_INDEX}} = mMatrix * pos;
    MOD_normal{{LIGHT_INDEX}} = norm;
#endif
