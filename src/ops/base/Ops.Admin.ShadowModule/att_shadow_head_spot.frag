// FRAGMENT HEAD type: SPOT count: {{LIGHT_INDEX}}
UNI ModLight MOD_light{{LIGHT_INDEX}};
IN vec4 modelPosMOD{{LIGHT_INDEX}};

#ifdef SHADOW_MAP
    IN vec4 shadowCoord{{LIGHT_INDEX}};
    UNI sampler2D shadowMap{{LIGHT_INDEX}};
#endif
