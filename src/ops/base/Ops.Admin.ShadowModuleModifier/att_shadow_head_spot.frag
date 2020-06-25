// FRAGMENT HEAD type: SPOT count: {{LIGHT_INDEX}}
IN vec4 modelPosMOD{{LIGHT_INDEX}};
IN vec3 MOD_normal{{LIGHT_INDEX}};

#ifdef HAS_SHADOW_MAP
    IN vec4 shadowCoord{{LIGHT_INDEX}};
#endif
