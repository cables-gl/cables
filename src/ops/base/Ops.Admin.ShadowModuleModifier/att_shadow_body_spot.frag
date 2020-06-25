// FRAGMENT BODY type: SPOT count: {{LIGHT_INDEX}}
 #ifdef HAS_SHADOW_MAP
        if (MOD_light{{LIGHT_INDEX}}.typeCastShadow.CAST_SHADOW == 1) {
            vec3 lightDirectionMOD{{LIGHT_INDEX}} = normalize(MOD_light{{LIGHT_INDEX}}.position - modelPosMOD{{LIGHT_INDEX}}.xyz);
            vec2 shadowMapLookup{{LIGHT_INDEX}} = shadowCoord{{LIGHT_INDEX}}.xy / shadowCoord{{LIGHT_INDEX}}.w;
            float shadowMapDepth{{LIGHT_INDEX}} = shadowCoord{{LIGHT_INDEX}}.z  / shadowCoord{{LIGHT_INDEX}}.w;
            float shadowStrength{{LIGHT_INDEX}} = MOD_light{{LIGHT_INDEX}}.shadowStrength;
            vec2 shadowMapSample{{LIGHT_INDEX}} = texture(MOD_shadowMap{{LIGHT_INDEX}}, shadowMapLookup{{LIGHT_INDEX}}).rg;
            float lambert{{LIGHT_INDEX}} = clamp(dot(lightDirectionMOD{{LIGHT_INDEX}}, normalize(MOD_normal{{LIGHT_INDEX}})), 0., 1.);
            float bias{{LIGHT_INDEX}} = clamp(MOD_light{{LIGHT_INDEX}}.shadowProperties.BIAS * tan(acos(lambert{{LIGHT_INDEX}})), 0., 0.1);

            #ifdef MODE_DEFAULT
                 col.rgb *= ShadowFactorDefault(shadowMapSample{{LIGHT_INDEX}}.r, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});
            #endif

            #ifdef MODE_PCF
                 col.rgb *= ShadowFactorPCF(MOD_shadowMap{{LIGHT_INDEX}}, shadowMapLookup{{LIGHT_INDEX}}, MOD_light{{LIGHT_INDEX}}.shadowProperties.MAP_SIZE, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});
            #endif

            #ifdef MODE_POISSON
                #ifdef WEBGL1
                    FillPoissonArray();
                #endif

                 col.rgb *= ShadowFactorPoisson(MOD_shadowMap{{LIGHT_INDEX}}, shadowMapLookup{{LIGHT_INDEX}}, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}});
            #endif

            #ifdef MODE_VSM
                 col.rgb *= ShadowFactorVSM(shadowMapSample{{LIGHT_INDEX}}, MOD_light{{LIGHT_INDEX}}.shadowProperties.BIAS, shadowMapDepth{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});
            #endif
        }
    #endif