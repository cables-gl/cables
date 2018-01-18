
float MOD_de=0.0;

#ifdef MOD_AREA_SPHERE
    MOD_de=distance(vec3(MOD_x,MOD_y,MOD_z),MOD_areaPos.xyz);
#endif

#ifdef MOD_AREA_AXIS_X
    MOD_de=abs(MOD_x-MOD_areaPos.x);
#endif
#ifdef MOD_AREA_AXIS_Y
    MOD_de=abs(MOD_y-MOD_areaPos.y);
#endif
#ifdef MOD_AREA_AXIS_Z
    MOD_de=abs(MOD_z-MOD_areaPos.z);
#endif

#ifdef MOD_AREA_AXIS_X_INFINITE
    MOD_de=MOD_x-MOD_areaPos.x;
#endif
#ifdef MOD_AREA_AXIS_Y_INFINITE
    MOD_de=MOD_y-MOD_areaPos.y;
#endif
#ifdef MOD_AREA_AXIS_Z_INFINITE
    MOD_de=MOD_z-MOD_areaPos.z;
#endif

MOD_de=MOD_de/MOD_size;

#ifdef MOD_AREA_INVERT
    MOD_de=1.0-MOD_de;
#endif


if(MOD_de<=0.5)discard;
