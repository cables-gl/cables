#ifndef PI
#define PI 3.14159265359
#endif

// from https://github.com/google/filament/blob/036bfa9b20d730bb8e5852ed449b024570167648/shaders/src/brdf.fs
// modified to fit variable names / structure
float F_Schlick(float f0, float f90, float VoH)
{
    return f0 + (f90 - f0) * pow(1.0 - VoH, 5.0);
}
vec3 F_Schlick(const vec3 f0, float VoH)
{
    float f = pow(1.0 - VoH, 5.0);
    return f + f0 * (1.0 - f);
}
float Fd_Burley(float roughness, float NoV, float NoL, float LoH)
{
    // Burley 2012, "Physically-Based Shading at Disney"
    float f90 = 0.5 + 2.0 * roughness * LoH * LoH;
    float lightScatter = F_Schlick(1.0, f90, NoL);
    float viewScatter  = F_Schlick(1.0, f90, NoV);
    return lightScatter * viewScatter * (1.0 / PI);
}
float D_GGX(float roughness, float NoH, const vec3 h)
{
    float oneMinusNoHSquared = 1.0 - NoH * NoH;

    float a = NoH * roughness;
    float k = roughness / (oneMinusNoHSquared + a * a);
    float d = k * k * (1.0 / PI);
    return clamp(d, 0.0, 1.0);
}
float V_SmithGGXCorrelated(float roughness, float NoV, float NoL)
{
    // Heitz 2014, "Understanding the Masking-Shadowing Function in Microfacet-Based BRDFs"
    float a2 = roughness * roughness;
    // TODO: lambdaV can be pre-computed for all the lights, it should be moved out of this function
    float lambdaV = NoL * sqrt((NoV - a2 * NoV) * NoV + a2);
    float lambdaL = NoV * sqrt((NoL - a2 * NoL) * NoL + a2);
    float v = 0.5 / (lambdaV + lambdaL);
    // a2=0 => v = 1 / 4*NoL*NoV   => min=1/4, max=+inf
    // a2=1 => v = 1 / 2*(NoL+NoV) => min=1/4, max=+inf
    // clamp to the maximum value representable in mediump
    return clamp(v, 0.0, 1.0);
}
// from https://github.com/google/filament/blob/73e339b05d67749e3b1d1d243650441162c10f8a/shaders/src/light_punctual.fs
// modified to fit variable names
float getSquareFalloffAttenuation(float distanceSquare, float falloff)
{
    float factor = distanceSquare * falloff;
    float smoothFactor = clamp(1.0 - factor * factor, 0.0, 1.0);
    // We would normally divide by the square distance here
    // but we do it at the call site
    return smoothFactor * smoothFactor;
}

float getDistanceAttenuation(vec3 posToLight, float falloff, vec3 V, float volume)
{
    float distanceSquare = dot(posToLight, posToLight);
    float attenuation = getSquareFalloffAttenuation(distanceSquare, falloff);
    // light far attenuation
    float d = dot(V, V);
    float f = 100.0; // CONFIG_Z_LIGHT_FAR, ttps://github.com/google/filament/blob/df6a100fcba66d9c99328a49d41fe3adecc0165d/filament/src/details/Engine.h
    vec2 lightFarAttenuationParams = 0.5 * vec2(10.0, 10.0 / (f * f));
    attenuation *= clamp(lightFarAttenuationParams.x - d * lightFarAttenuationParams.y, 0.0, 1.0);
    // Assume a punctual light occupies a min volume of 1cm to avoid a division by 0
    return attenuation / max(distanceSquare, max(1e-4, volume));
}

#ifdef USE_CLEAR_COAT
// from https://github.com/google/filament/blob/73e339b05d67749e3b1d1d243650441162c10f8a/shaders/src/shading_model_standard.fs
// modified to fit variable names / structure
float clearCoatLobe(vec3 shading_clearCoatNormal, vec3 h, float LoH, float CCSpecK)
{
    float clearCoatNoH = clamp(dot(shading_clearCoatNormal, h), 0.0, 1.0);

    // clear coat specular lobe
    float D = D_GGX(CCSpecK, clearCoatNoH, h);
    // from https://github.com/google/filament/blob/036bfa9b20d730bb8e5852ed449b024570167648/shaders/src/brdf.fs
    float V = clamp(0.25 / (LoH * LoH), 0.0, 1.0);
    float F = F_Schlick(0.04, 1.0, LoH); // fix IOR to 1.5

    return D * V * F;
}
#endif

#ifdef USE_ENVIRONMENT_LIGHTING
vec3 evaluateLighting(Light light, vec3 L, vec4 FragPos, vec3 V, vec3 N, vec3 albedo, float specK, float NdotV, vec3 F0, float envBRDFY, float AO, bool hasFalloff)
#else
vec3 evaluateLighting(Light light, vec3 L, vec4 FragPos, vec3 V, vec3 N, vec3 albedo, float specK, float NdotV, vec3 F0, float AO, bool hasFalloff)
#endif
{
    vec3 directLightingResult = vec3(0.0);
    if (light.castLight == 1)
    {
        specK = max(0.08, specK);
        // from https://github.com/google/filament/blob/73e339b05d67749e3b1d1d243650441162c10f8a/shaders/src/shading_model_standard.fs
        // modified to fit variable names / structure
        vec3 H = normalize(V + L);

        float NdotL = clamp(dot(N, L), 0.0, 1.0);
        float NdotH = clamp(dot(N, H), 0.0, 1.0);
        float LdotH = clamp(dot(L, H), 0.0, 1.0);

        vec3 Fd = albedo * Fd_Burley(specK, NdotV, NdotL, LdotH);

        float D  = D_GGX(specK, NdotH, H);
        float V2 = V_SmithGGXCorrelated(specK, NdotV, NdotL);
        vec3  F  = F_Schlick(F0, LdotH);

        // TODO: modify this with the radius
        vec3 Fr = (D * V2) * F;

        #ifdef USE_ENVIRONMENT_LIGHTING
        vec3 directLighting = Fd + Fr * (1.0 + F0 * (1.0 / envBRDFY - 1.0));
        #else
        vec3 directLighting = Fd + Fr;
        #endif

        float attenuation = getDistanceAttenuation(L, hasFalloff ? light.lightProperties.FALLOFF : 0.0, V, light.lightProperties.RADIUS);

        directLightingResult = (directLighting * light.color) *
                          (light.lightProperties.INTENSITY * attenuation * NdotL * AO);

        #ifdef USE_CLEAR_COAT
        directLightingResult += clearCoatLobe(normM, H, LdotH, _ClearCoatRoughness);
        #endif
    }
    return directLightingResult;
}

// from phong OP to make sure the light parameters change lighting similar to what people are used to
float CalculateSpotLightEffect(vec3 lightPosition, vec3 conePointAt, float cosConeAngle, float cosConeAngleInner, float spotExponent, vec3 lightDirection) {
    vec3 spotLightDirection = normalize(lightPosition-conePointAt);
    float spotAngle = dot(-lightDirection, spotLightDirection);
    float epsilon = cosConeAngle - cosConeAngleInner;

    float spotIntensity = clamp((spotAngle - cosConeAngle)/epsilon, 0.0, 1.0);
    spotIntensity = pow(spotIntensity, max(0.01, spotExponent));

    return max(0., spotIntensity);
}
