// VERTEX HEAD type: SPOT count: {{LIGHT_INDEX}}
#ifdef HAS_SHADOW_MAP
    OUT vec4 modelPosMOD{{LIGHT_INDEX}};
    OUT vec3 MOD_normal{{LIGHT_INDEX}};
    // UNI float MOD_normalOffset{{LIGHT_INDEX}};
    // UNI mat4 MOD_lightMatrix{{LIGHT_INDEX}};
    OUT vec4 shadowCoord{{LIGHT_INDEX}};
#endif