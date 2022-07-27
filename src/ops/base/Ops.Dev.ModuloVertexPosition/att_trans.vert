
#ifdef MOD_AXIS_X
pos.x=mod(pos.x,MOD_modulo);
#endif

#ifdef MOD_AXIS_Y
pos.y=mod(pos.y,MOD_modulo);
#endif

#ifdef MOD_AXIS_Z
pos.z=mod(pos.z,MOD_modulo);
#endif