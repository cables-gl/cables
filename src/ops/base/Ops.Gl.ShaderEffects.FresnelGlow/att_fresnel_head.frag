IN vec4 MOD_cameraSpace_pos;
IN mat3 MOD_viewMatrix;
IN vec3 MOD_norm;

#ifdef ENABLE_FRESNEL_MOD
    float MOD_CalculateFresnel(vec3 cameraSpace_pos, vec3 normal)
    {

        vec3 nDirection = normalize(cameraSpace_pos);
        vec3 nNormal = normalize(MOD_viewMatrix * normal);
        vec3 halfDirection = normalize(nNormal + nDirection);

        float cosine = dot(halfDirection, nDirection);
        float product = max(cosine, 0.0);
        float factor = pow(product, MOD_inFresnelExponent);

        return 5. * factor;


    }
#endif
