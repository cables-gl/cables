 for(int l=0;l<NUM_LIGHTS;l++)
    {
        vec3 lightDirection = normalize(lights[l].position - modelPos.xyz);
        if (lights[l].typeCastShadow.TYPE == DIRECTIONAL) lightDirection = lights[l].position;


        float lambert = 1.; // inout variable
        vec3 diffuseColor = CalculateDiffuseColor(lightDirection, normal, lights[l].color, materialColor.rgb, lambert);

        diffuseColor *= lights[l].lightProperties.INTENSITY;

        if (lights[l].typeCastShadow.TYPE == SPOT) {
                float spotIntensity = CalculateSpotLightEffect(
                    lights[l].position, lights[l].conePointAt, lights[l].spotProperties.COSCONEANGLE,
                    lights[l].spotProperties.COSCONEANGLEINNER, lights[l].spotProperties.SPOTEXPONENT,
                    lightDirection
                );
                diffuseColor *= spotIntensity;
        }

        if (lights[l].typeCastShadow.TYPE != DIRECTIONAL) {
            vec3 lightModelDiff=lights[l].position - modelPos.xyz;
            diffuseColor *= CalculateFalloff(lights[l].lightProperties.RADIUS, lights[l].lightProperties.FALLOFF, length(lightModelDiff));
        }




            /*
            #ifdef SHADOW_MAP
            if (lights[l].typeCastShadow.CAST_SHADOW == 1) {
            vec2 shadowMapLookup = shadowCoords[l].xy / shadowCoords[l].w;
              float shadowMapDepth = shadowCoords[l].z  / shadowCoords[l].w;

                vec2 shadowMapSample = vec2(1.);
                float cameraNear, cameraFar;
                float shadowStrength = lights[l].shadowStrength;

                if (lights[l].typeCastShadow.TYPE == POINT) {
                    cameraNear = lights[l].shadowProperties.NEAR; // uniforms
                    cameraFar =  lights[l].shadowProperties.FAR;

                    float fromLightToFrag = (length(modelPos.xyz - lights[l].position) - cameraNear) / (cameraFar - cameraNear);

                    #ifdef WEBGL2
                        shadowMapSample = texture(shadowCubeMap, -lightDirection).rg;
                    #endif

                    #ifdef WEBGL1
                        shadowMapSample = textureCube(shadowCubeMap, -lightDirection).rg;
                    #endif

                    shadowMapDepth = fromLightToFrag;

                } else {
                   // vec4 GetSampleFromArray(sampler2D textures[NUM_LIGHTS], int ndx, vec2 uv) {
                    if (l == 0) {
                        shadowMapSample = texture(shadowMaps[0], shadowMapLookup).rg;
                    }
                }

                #ifndef MODE_VSM
                    // https://digitalrune.github.io/DigitalRune-Documentation/html/3f4d959e-9c98-4a97-8d85-7a73c26145d7.htm
                    // Depth Bias: The pixel is moved in the direction of the light.
                    // Slope-Scaled Depth Bias: Like the depth bias, but the offset depends on the slope of the surface because shadow acne is bigger on slopes which are nearly parallel to the light.
                    // Normal Offset [1]: The pixels are moved in the direction of the surface normal. The offset can be proportional to the slope.
                    // View Direction Offset [2]: Like the normal offset but instead of moving into the normal direction, the pixel is moved in the view direction. This is cheaper but not as good as the normal offset.
                    // Receiver Plane Depth Bias [3][4]: The receiver plane is calculated to analytically find the ideal bias.

                    // modify bias according to slope of the surface
                    float bias = lights[l].shadowProperties.BIAS;
                    if (lights[l].typeCastShadow.TYPE != DIRECTIONAL) bias = clamp(lights[l].shadowProperties.BIAS * tan(acos(lambert)), 0., 0.1);
                #endif

                #ifdef MODE_DEFAULT
                    //diffuseColor *= ShadowFactorDefault(shadowMapSample.r, shadowMapDepth, bias, shadowStrength);
                    if (shadowMapSample.r < shadowMapDepth - bias) diffuseColor *= (1. - shadowStrength); // todo: make this uniform value from light or from material?

                #endif
                #ifdef MODE_PCF
                    if (lights[l].typeCastShadow.TYPE == POINT) {
                        diffuseColor *= ShadowFactorPointPCF(shadowCubeMap, lightDirection, shadowMapDepth, cameraNear, cameraFar, bias, shadowStrength);
                    }
                    else diffuseColor *= ShadowFactorPCF(shadowMaps[0], shadowMapLookup, lights[l].shadowProperties.MAP_SIZE, shadowMapDepth, bias, shadowStrength);
                #endif


                #ifdef MODE_POISSON
                    #ifdef WEBGL1
                        FillPoissonArray();
                    #endif
                    if (lights[l].typeCastShadow.TYPE == POINT) diffuseColor *= ShadowFactorPointPoisson(shadowCubeMap, lightDirection, shadowMapDepth, bias);
                    else diffuseColor *= ShadowFactorPoisson(shadowMaps[0], shadowMapLookup, shadowMapDepth, bias);
                #endif

                #ifdef MODE_VSM
                    diffuseColor *= ShadowFactorVSM(shadowMapSample, lights[l].shadowProperties.BIAS, shadowMapDepth, shadowStrength);
                #endif
            }
        #endif
        */
         calculatedColor += diffuseColor;
    }
