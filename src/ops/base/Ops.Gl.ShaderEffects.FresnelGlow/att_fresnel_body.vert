#ifdef ENABLE_FRESNEL_MOD
    MOD_cameraSpace_pos = viewMatrix*mMatrix * pos;
    MOD_norm = norm;
    MOD_viewMatrix = mat3(viewMatrix);
#endif