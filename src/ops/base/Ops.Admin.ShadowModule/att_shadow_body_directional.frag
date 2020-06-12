// FRAGMENT BODY type: DIRECTIONAL count: {{LIGHT_INDEX}}
 #ifdef SHADOW_MAP
        if (light{{LIGHT_INDEX}}.typeCastShadow.CAST_SHADOW == 1) {
            vec2 shadowMapLookup{{LIGHT_INDEX}} = shadowCoord{{LIGHT_INDEX}}.xy / shadowCoord{{LIGHT_INDEX}}.w;
            float shadowMapDepth{{LIGHT_INDEX}} = shadowCoord{{LIGHT_INDEX}}.z  / shadowCoord{{LIGHT_INDEX}}.w;
            float shadowStrength{{LIGHT_INDEX}} = light{{LIGHT_INDEX}}.shadowStrength;
            vec2 shadowMapSample{{LIGHT_INDEX}} = texture(shadowMap{{LIGHT_INDEX}}, shadowMapLookup{{LIGHT_INDEX}}).rg;
            float bias{{LIGHT_INDEX}} = light{{LIGHT_INDEX}}.shadowProperties.BIAS;

             #ifdef MODE_DEFAULT
                 col.rgb *= ShadowFactorDefault(shadowMapSample{{LIGHT_INDEX}}.r, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});
            #endif

            #ifdef MODE_PCF
                 col.rgb *= ShadowFactorPCF(shadowMap{{LIGHT_INDEX}}, shadowMapLookup{{LIGHT_INDEX}}, light{{LIGHT_INDEX}}.shadowProperties.MAP_SIZE, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});
            #endif

            #ifdef MODE_POISSON
                #ifdef WEBGL1
                    FillPoissonArray();
                #endif

                 col.rgb *= ShadowFactorPoisson(shadowMap{{LIGHT_INDEX}}, shadowMapLookup{{LIGHT_INDEX}}, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}});
            #endif

            #ifdef MODE_VSM
                 col.rgb *= ShadowFactorVSM(shadowMapSample{{LIGHT_INDEX}}, light{{LIGHT_INDEX}}.shadowProperties.BIAS, shadowMapDepth{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});
            #endif
        }
    #endif