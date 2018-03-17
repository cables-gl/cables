
#ifndef MOD_WORLDSPACE
   pos.xyz=MOD_deform(pos.xyz);
   norm=MOD_calcNormal(pos.xyz);
#endif

#ifdef MOD_WORLDSPACE
   pos.xyz=MOD_deform( (mMatrix*pos).xyz );
#endif
