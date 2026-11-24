{
    #ifdef MOD_LOOP
        float MOD_span = MOD_numPoints;
    #else
        float MOD_span = MOD_numPoints - 1.0;
    #endif

    float MOD_u = (MOD_start + (pos.x / MOD_meshLength + 0.5) * MOD_length) * MOD_span;

    vec3 MOD_p, MOD_t, MOD_up;
    MOD_frame(MOD_u, MOD_p, MOD_t, MOD_up);

    // mesh x -> tangent, y -> up, z -> right
    mat3 MOD_m = mat3(MOD_t, MOD_up, cross(MOD_t, MOD_up));

    pos.xyz = MOD_p + MOD_m * vec3(0.0, pos.y, pos.z);
    norm = MOD_m * norm;
}
