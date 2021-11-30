
vec3 MOD_pos=(pos*mMatrix).xyz;
float MOD_v=0.0;

#ifdef MOD_SRC_XZ
   MOD_v=(MOD_pos.x*MOD_pos.z)+MOD_add;
#endif
#ifdef MOD_SRC_XY
   MOD_v=(MOD_pos.x*MOD_pos.y)+MOD_add;
#endif
#ifdef MOD_SRC_X
   MOD_v=MOD_pos.x+MOD_add;
#endif
#ifdef MOD_SRC_Y
   MOD_v=MOD_pos.y+MOD_add;
#endif
#ifdef MOD_SRC_Z
   MOD_v=MOD_pos.z+MOD_add;
#endif

MOD_v=sin( MOD_time+( MOD_v*MOD_mul  )* MOD_frequency + MOD_phase ) * MOD_amount;

#ifdef MOD_TO_AXIS_X
   pos.x+=MOD_v;
#endif

#ifdef MOD_TO_AXIS_Y
   pos.y+=MOD_v;
#endif

#ifdef MOD_TO_AXIS_Z
   pos.z+=MOD_v;
#endif
