
#ifndef MOD_WORLDSPACE
   vec4 MOD_vertPos=vec4(pos.xyz,1.0);
#endif
#ifdef MOD_WORLDSPACE
   vec4 MOD_vertPos=mMatrix*pos;
#endif

#ifdef MOD_AREA_SPHERE
    float MOD_de=distance(
        MOD_posSize.xyz,
        vec3(MOD_vertPos.x,MOD_vertPos.y,MOD_vertPos.z)
        );
#endif

#ifdef MOD_AREA_BOX
    float MOD_de=0.0;
    if(abs(MOD_vertPos.y-MOD_posSize.y)>MOD_posSize.w ||
        abs(MOD_vertPos.x-MOD_posSize.x)>MOD_posSize.w ||
        abs(MOD_vertPos.z-MOD_posSize.z)>MOD_posSize.w ) MOD_de=1.0;
#endif

#ifdef MOD_AREA_AXIS_X
    float MOD_de=abs(MOD_posSize.x-MOD_vertPos.x);
#endif
#ifdef MOD_AREA_AXIS_Y
    float MOD_de=abs(MOD_posSize.y-MOD_vertPos.y);
#endif
#ifdef MOD_AREA_AXIS_Z
    float MOD_de=abs(MOD_posSize.z-MOD_vertPos.z);
#endif

#ifdef MOD_AREA_AXIS_X_INFINITE
    float MOD_de=MOD_posSize.x-MOD_vertPos.x;
#endif
#ifdef MOD_AREA_AXIS_Y_INFINITE
    float MOD_de=MOD_posSize.y-MOD_vertPos.y;
#endif
#ifdef MOD_AREA_AXIS_Z_INFINITE
    float MOD_de=MOD_posSize.z-MOD_vertPos.z;
#endif

#ifndef MOD_AREA_BOX
    MOD_de=1.0-smoothstep(MOD_falloff,MOD_posSize.w,MOD_de);
#endif

#ifdef MOD_AREA_INVERT
    MOD_de=1.0-MOD_de;
#endif

float MOD_v=0.0;

#ifdef MOD_SRC_XZ
   MOD_v=(MOD_vertPos.x+MOD_vertPos.z);
#endif
#ifdef MOD_SRC_XY
   MOD_v=(MOD_vertPos.x+MOD_vertPos.y);
#endif
#ifdef MOD_SRC_X
   MOD_v=MOD_vertPos.x;
#endif
#ifdef MOD_SRC_Y
   MOD_v=MOD_vertPos.y;
#endif
#ifdef MOD_SRC_Z
   MOD_v=MOD_vertPos.z;
#endif

#ifdef MOD_SRC_LENGTH
  MOD_v=length(MOD_vertPos.xyz);
#endif


float MOD_amnt=MOD_amount*MOD_de;

MOD_v=sin( (MOD_time)+( MOD_v*MOD_scale  ) ) ;
#ifdef MOD_POSITIVE
    MOD_v=(MOD_v+1.0)/2.0;
#endif
MOD_v*=MOD_amnt;




#ifdef MOD_TO_AXIS_X
   pos.x+=MOD_v;
//   norm.x+=MOD_v;
#endif

#ifdef MOD_TO_AXIS_Y
   pos.y+=MOD_v;
//   norm.y+=MOD_v;
#endif

#ifdef MOD_TO_AXIS_Z
   pos.z+=MOD_v;
//   norm.z+=MOD_v;
#endif

// norm=normalize(norm);





