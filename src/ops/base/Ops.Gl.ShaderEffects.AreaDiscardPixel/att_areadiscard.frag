

float MOD_de=0.0;

#ifdef MOD_AREA_SPHERE
    MOD_de=distance(vec3(MOD_x,MOD_y,MOD_z),MOD_areaPos.xyz/MOD_sizeAxis);
#endif

#ifdef MOD_AREA_BOX
    if( abs(MOD_y-MOD_areaPos.y/(MOD_sizeAxis.y*MOD_size))>0.5 ||
        abs(MOD_x-MOD_areaPos.x/(MOD_sizeAxis.x*MOD_size))>0.5 ||
        abs(MOD_z-MOD_areaPos.z/(MOD_sizeAxis.z*MOD_size))>0.5 ) MOD_de=1.0;
#endif

#ifdef MOD_AREA_AXIS_X
    MOD_de=abs(MOD_x-MOD_areaPos.x);
#endif
#ifdef MOD_AREA_AXIS_XY
    MOD_de=abs(MOD_x-MOD_areaPos.x+MOD_areaPos.y);
#endif
#ifdef MOD_AREA_AXIS_XZ
    MOD_de=abs(MOD_x-MOD_areaPos.x+MOD_areaPos.z);
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

#ifdef MOD_AREA_REPEAT
    MOD_de=mod(MOD_de,MOD_size+MOD_repeat);
#endif

MOD_de=MOD_de/MOD_size;

#ifdef MOD_AREA_INVERT
    MOD_de=1.0-MOD_de;
#endif


if(MOD_de<=0.5) discard;

