
vec3 N = normalize( mat3(normalMatrix) * v_normal).xyz;
vec3 V = -v_eyeCoords;
vec3 R = -reflect(V,N);
vec3 T = ( mat3( inverseViewMatrix ) * R ).xyz; // Transform by inverse of the view transform that was applied to the skybo

// col = mix(col,texture(cubeMap, T).rgb,MOD_amount);
// col = mix(col,texture(cubeMap, T).rgba*length(col),MOD_amount);

// col.rgb=texture(MOD_cubemap, T).rgb*MOD_amount;
col.rgb=mix(col.rgb,texture(MOD_cubemap, T).rgb,MOD_amount);


// col.r=1.0;
// col.a=1.0;

// col.rgb=T;

