#ifdef SLOT_POS_WORLD
    MOD_pos_world=(mMatrix*pos).xyz;
#endif

#ifdef SLOT_POS_LOCAL
    MOD_pos_local=vPosition.xyz;
#endif

#ifdef SLOT_POS_NORMAL_MV
    MOD_normal_mv=((viewMatrix*mMatrix)*vec4(norm,1.0)).xyz;
#endif