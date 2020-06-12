#ifdef SHADOW_MAP
    modelPosMOD{{LIGHT_INDEX}} = mMatrix*pos;
    shadowCoord{{LIGHT_INDEX}} = lightMatrix{{LIGHT_INDEX}} * (modelPosMOD{{LIGHT_INDEX}} + vec4(norm, 1) * normalOffset{{LIGHT_INDEX}});
#endif