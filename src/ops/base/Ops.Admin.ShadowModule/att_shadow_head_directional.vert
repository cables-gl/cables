// VERTEX HEAD type: DIRECTIONAL count: {{LIGHT_INDEX}}
#ifdef SHADOW_MAP
    OUT vec4 modelPosMOD{{LIGHT_INDEX}};
    UNI float MOD_normalOffset{{LIGHT_INDEX}};
    UNI mat4 MOD_lightMatrix{{LIGHT_INDEX}};
    OUT vec4 shadowCoord{{LIGHT_INDEX}};
#endif