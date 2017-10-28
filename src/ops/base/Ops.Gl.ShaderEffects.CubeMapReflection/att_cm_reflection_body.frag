
vec3 N = normalize( mat3(normalMatrix) * v_normal).xyz;
vec3 V = -v_eyeCoords;
vec3 R = -reflect(V,N);
vec3 T = ( mat3( inverseViewMatrix ) * R ).xyz; // Transform by inverse of the view transform that was applied to the skybo

col = mix(col,texture(cubeMap, T).rgb*length(col),MOD_amount);
