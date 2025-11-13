// FRAGMENT HEAD type: POINT count: {{LIGHT_INDEX}}
#ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}
    IN vec4 MOD_modelPos{{LIGHT_INDEX}};
    IN vec3 MOD_normal{{LIGHT_INDEX}};
#endif
