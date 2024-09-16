
#ifdef MOD_SLOT_POS_WORLD
    in vec3 MOD_pos_world;
#endif

#ifdef MOD_SLOT_POS_LOCAL
    in vec3 MOD_pos_local;
#endif

#ifdef MOD_SLOT_POS_OBJECT
    in vec3 MOD_pos_object;
#endif

#ifdef MOD_SLOT_POS_NORMAL_WORLD
    in vec3 MOD_normal_world;
#endif

#ifdef MOD_SLOT_POS_NORMAL_MV
    in vec3 MOD_normal_mv;
#endif

#ifdef MOD_SLOT_POS_MV
    in vec3 MOD_pos_mv;
#endif


#ifdef MOD_UNI_OBJECT_ID
    UNI float objectId;
#endif

#ifdef MOD_UNI_MATERIAL_ID
    UNI float materialId;
#endif

