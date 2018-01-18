
#define AREA_PLANE_X

#ifdef MOD_AREA_SPHERE
    float MOD_de=distance(vec3(MOD_x,MOD_y,MOD_z),MOD_areaPos.xyz);
#endif
#ifdef MOD_AREA_AXIS_X
    float MOD_de=abs(MOD_x-MOD_areaPos.x);
#endif
#ifdef MOD_AREA_AXIS_Y
    float MOD_de=abs(MOD_y-MOD_areaPos.y);
#endif
#ifdef MOD_AREA_AXIS_Z
    float MOD_de=abs(MOD_z-MOD_areaPos.z);
#endif

MOD_de=1.0-smoothstep(MOD_falloff*MOD_size,MOD_size,MOD_de);

#ifdef MOD_AREA_INVERT
    MOD_de=1.0-MOD_de;
#endif

col.rgb=mix(col.rgb,vec3(MOD_r,MOD_g,MOD_b), MOD_de*MOD_amount);
