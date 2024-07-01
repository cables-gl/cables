vec3 MOD_areaPos=(pos*mMatrix).xyz;

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

MOD_de=1.0-smoothstep(MOD_falloff*MOD_size,MOD_size,MOD_de);

#ifdef MOD_AREA_INVERT
    MOD_de=1.0-MOD_de;
#endif


float MOD_x=MOD_random(vec2(attrSubmesh*2.0,attrSubmesh));
float MOD_y=MOD_random(vec2(attrSubmesh,attrSubmesh));
float MOD_z=MOD_random(vec2(attrSubmesh*3.0,attrSubmesh));



vec3 pp=pos.xyz;
// pos.xyz=pos.xyz+(vec3(MOD_x,MOD_y,MOD_z)*MOD_size*(MOD_amount*MOD_de));

pos.xyz+=vec3(MOD_x,MOD_y,MOD_z)*(MOD_amount*MOD_de);

// pos.xyz-=pp*(MOD_scale);//+(vec3(MOD_x,MOD_y,MOD_z)*90.0*MOD_amount);


// float MOD_x=MOD_random(texCoord*2.0);
// float MOD_y=MOD_random(texCoord);
// float MOD_z=MOD_random(texCoord*3.0);
// pos.xyz=pos.xyz*(1.0-MOD_amount)+(vec3(MOD_x,MOD_y,MOD_z)*90.0*MOD_amount);
