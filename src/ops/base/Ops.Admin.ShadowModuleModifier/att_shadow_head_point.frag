// FRAGMENT HEAD type: POINT count: {{LIGHT_INDEX}}
#ifdef HAS_SHADOW_MAP
    IN vec4 modelPosMOD{{LIGHT_INDEX}};
    IN vec3 MOD_normal{{LIGHT_INDEX}};
#endif