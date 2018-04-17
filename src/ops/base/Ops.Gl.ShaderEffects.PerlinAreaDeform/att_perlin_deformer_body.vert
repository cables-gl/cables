
vec3 MOD_newPos;
#ifndef MOD_WORLDSPACE
   MOD_newPos=MOD_deform(pos.xyz);
   norm=MOD_calcNormal(pos.xyz);
#endif

#ifdef MOD_WORLDSPACE
   MOD_newPos=MOD_deform( (mMatrix*pos).xyz );
#endif

#ifdef MOD_DO_X
    pos.x=MOD_newPos.x;
#endif
#ifdef MOD_DO_Y
    pos.y=MOD_newPos.y;
#endif
#ifdef MOD_DO_Z
    pos.z=MOD_newPos.z;
#endif

