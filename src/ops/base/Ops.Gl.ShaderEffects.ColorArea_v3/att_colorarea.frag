

#ifdef MOD_AREA_SPHERE
    float MOD_de=distance(
        MOD_pos,
        vec3(MOD_vertPos.x*MOD_inSizeAmountFalloffSizeX.w,MOD_vertPos.y,MOD_vertPos.z)
        );
#endif

#ifdef MOD_AREA_BOX
    float MOD_de=0.0;
    if(abs(MOD_vertPos.y-MOD_pos.y)>MOD_inSizeAmountFalloffSizeX.x ||
        abs(MOD_vertPos.x-MOD_pos.x)>MOD_inSizeAmountFalloffSizeX.x ||
        abs(MOD_vertPos.z-MOD_pos.z)>MOD_inSizeAmountFalloffSizeX.x ) MOD_de=1.0;
#endif

#ifdef MOD_AREA_AXIS_X
    float MOD_de=abs(MOD_pos.x-MOD_vertPos.x);
#endif
#ifdef MOD_AREA_AXIS_Y
    float MOD_de=abs(MOD_pos.y-MOD_vertPos.y);
#endif
#ifdef MOD_AREA_AXIS_Z
    float MOD_de=abs(MOD_pos.z-MOD_vertPos.z);
#endif

#ifdef MOD_AREA_AXIS_X_INFINITE
    float MOD_de=MOD_pos.x-MOD_vertPos.x;
#endif
#ifdef MOD_AREA_AXIS_Y_INFINITE
    float MOD_de=MOD_pos.y-MOD_vertPos.y;
#endif
#ifdef MOD_AREA_AXIS_Z_INFINITE
    float MOD_de=MOD_pos.z-MOD_vertPos.z;
#endif

#ifndef MOD_AREA_BOX
    MOD_de=1.0-smoothstep(MOD_inSizeAmountFalloffSizeX.z*MOD_inSizeAmountFalloffSizeX.x,MOD_inSizeAmountFalloffSizeX.x,MOD_de);
#endif

#ifdef MOD_AREA_INVERT
    MOD_de=1.0-MOD_de;
#endif

#ifdef MOD_BLEND_NORMAL
    col.rgb=mix(col.rgb,MOD_color, MOD_de*MOD_inSizeAmountFalloffSizeX.y);
#endif


#ifdef MOD_BLEND_MULTIPLY
    col.rgb=mix(col.rgb,col.rgb*MOD_color,MOD_de*MOD_inSizeAmountFalloffSizeX.y);
#endif

#ifdef MOD_BLEND_ADD
    col.rgb+=MOD_de*MOD_inSizeAmountFalloffSizeX.y*MOD_color;
#endif


#ifdef MOD_BLEND_OPACITY
    col.a*=(1.0-MOD_de*MOD_inSizeAmountFalloffSizeX.y);
#endif

#ifdef MOD_BLEND_DISCARD
    if(MOD_de*MOD_inSizeAmountFalloffSizeX.y>=0.999)discard;
#endif

// col.rgb=vec3(distance(MOD_vertPos.xyz,MOD_pos.xyz))*0.1
// col.rgb=MOD_pos.xyz;