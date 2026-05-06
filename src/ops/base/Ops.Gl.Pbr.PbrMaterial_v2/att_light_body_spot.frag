
vec3 L{{LIGHT_INDEX}} = normalize(lightOP{{LIGHT_INDEX}}.position - FragPos.xyz);
float spotIntensity{{LIGHT_INDEX}} = CalculateSpotLightEffect(
    lightOP{{LIGHT_INDEX}}.position, lightOP{{LIGHT_INDEX}}.conePointAt, lightOP{{LIGHT_INDEX}}.spotProperties.COSCONEANGLE,
    lightOP{{LIGHT_INDEX}}.spotProperties.COSCONEANGLEINNER, lightOP{{LIGHT_INDEX}}.spotProperties.SPOTEXPONENT,
    L{{LIGHT_INDEX}}
);
#ifdef USE_ENVIRONMENT_LIGHTING
directLighting += evaluateLighting(lightOP{{LIGHT_INDEX}}, L{{LIGHT_INDEX}}, FragPos, V, N, albedo, specK, NdotV, F0, envBRDF.y, AO * spotIntensity{{LIGHT_INDEX}}, true);
#else
directLighting += evaluateLighting(lightOP{{LIGHT_INDEX}}, L{{LIGHT_INDEX}}, FragPos, V, N, albedo, specK, NdotV, F0, AO * spotIntensity{{LIGHT_INDEX}}, true);
#endif
