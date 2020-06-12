// VERTEX HEAD type: SPOT count: {{LIGHT_INDEX}}
#ifdef SHADOW_MAP
    OUT vec4 modelPosMOD{{LIGHT_INDEX}};
    UNI float normalOffset{{LIGHT_INDEX}};
    UNI mat4 lightMatrix{{LIGHT_INDEX}};
    OUT vec4 shadowCoord{{LIGHT_INDEX}};
#endif