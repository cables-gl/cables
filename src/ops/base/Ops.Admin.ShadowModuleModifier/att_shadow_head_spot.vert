// VERTEX HEAD type: SPOT count: {{LIGHT_INDEX}}
#ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}
    OUT vec4 MOD_modelPos{{LIGHT_INDEX}};
    OUT vec3 MOD_normal{{LIGHT_INDEX}};
    OUT vec4 MOD_shadowCoord{{LIGHT_INDEX}};
#endif
