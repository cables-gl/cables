#ifdef MOD_SLOT_POS_WORLD
    MOD_pos_world=(mMatrix*pos).xyz;
#endif

#ifdef MOD_SLOT_POS_OBJECT
    MOD_pos_object=(mMatrix*vec4(0.,0.,0.,1.)).xyz;
#endif

#ifdef MOD_SLOT_POS_LOCAL
    MOD_pos_local=vPosition.xyz;
#endif

#ifdef MOD_SLOT_POS_NORMAL_MV
    MOD_normal_mv=((viewMatrix*mMatrix)*vec4(norm,1.0)).xyz;
#endif

#ifdef MOD_SLOT_POS_MV
    MOD_pos_mv=((viewMatrix*mMatrix)*vec4(pos.xyz,1.0)).xyz;
#endif


#ifdef MOD_SLOT_POS_NORMAL_WORLD
    MOD_normal_world=(mMatrix*vec4(norm,1.0)).xyz;
#endif

