
vec3 L{{LIGHT_INDEX}} = normalize(lightOP{{LIGHT_INDEX}}.position);
#ifdef USE_ENVIRONMENT_LIGHTING
directLighting += evaluateLighting(lightOP{{LIGHT_INDEX}}, L{{LIGHT_INDEX}}, FragPos, V, N, albedo, specK, NdotV, F0, envBRDF.y, AO, false);
#else
directLighting += evaluateLighting(lightOP{{LIGHT_INDEX}}, L{{LIGHT_INDEX}}, FragPos, V, N, albedo, specK, NdotV, F0, AO, false);
#endif
