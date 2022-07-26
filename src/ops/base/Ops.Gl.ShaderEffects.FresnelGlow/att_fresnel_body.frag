#ifdef ENABLE_FRESNEL_MOD
    vec3 MOD_fragNormal = normalize(MOD_norm);
    col.rgb += MOD_inFresnel.rgb *
        MOD_CalculateFresnel(vec3(MOD_cameraSpace_pos), MOD_fragNormal)
        * MOD_inFresnel.w;
#endif
