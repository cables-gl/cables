

float MOD_v=texture(MOD_tex,vec2( (MOD_height*0.5 + pos.y)/MOD_height ,0.5)).r;
MOD_v*=MOD_amount;

#ifdef MOD_AXIS_XZ
    pos.xz*=MOD_v;
#endif

#ifdef MOD_AXIS_XY
    pos.xy*=MOD_v;
#endif

#ifdef MOD_AXIS_YZ
    pos.yz*=MOD_v;
#endif

#ifdef MOD_AXIS_X
    pos.x*=MOD_v;
#endif

#ifdef MOD_AXIS_Y
    pos.y*=MOD_v;
#endif

#ifdef MOD_AXIS_Z
    pos.z*=MOD_v;
#endif
