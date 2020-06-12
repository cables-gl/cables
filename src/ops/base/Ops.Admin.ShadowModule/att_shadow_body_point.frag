// FRAGMENT BODY type: POINT count: {{LIGHT_INDEX}}
 #ifdef SHADOW_MAP
        if (light{{LIGHT_INDEX}}.typeCastShadow.CAST_SHADOW == 1) {
            vec3 lightDirectionMOD{{LIGHT_INDEX}} = normalize(light{{LIGHT_INDEX}}.position - modelPosMOD{{LIGHT_INDEX}}.xyz);
            float shadowStrength{{LIGHT_INDEX}} = light{{LIGHT_INDEX}}.shadowStrength;

            float cameraNear{{LIGHT_INDEX}} = light{{LIGHT_INDEX}}.shadowProperties.NEAR; // uniforms
            float cameraFar{{LIGHT_INDEX}} =  light{{LIGHT_INDEX}}.shadowProperties.FAR;

            float fromLightToFrag{{LIGHT_INDEX}} = (length(modelPosMOD{{LIGHT_INDEX}}.xyz - light{{LIGHT_INDEX}}.position) - cameraNear{{LIGHT_INDEX}}) / (cameraFar{{LIGHT_INDEX}} - cameraNear{{LIGHT_INDEX}});

            float shadowMapDepth{{LIGHT_INDEX}} = fromLightToFrag{{LIGHT_INDEX}};
            // float bias{{LIGHT_INDEX}} = clamp(light{{LIGHT_INDEX}}.shadowProperties.BIAS, 0., 1.);
            float lambert{{LIGHT_INDEX}} = clamp(dot(lightDirectionMOD{{LIGHT_INDEX}}, normal), 0., 1.);
            float bias{{LIGHT_INDEX}} = clamp(light{{LIGHT_INDEX}}.shadowProperties.BIAS * tan(acos(lambert{{LIGHT_INDEX}})), 0., 0.1);
            vec2 shadowMapSample{{LIGHT_INDEX}} = textureCube(shadowMap{{LIGHT_INDEX}}, -lightDirectionMOD{{LIGHT_INDEX}}).rg;




            #ifdef MODE_DEFAULT
                 col.rgb *= ShadowFactorDefault(shadowMapSample{{LIGHT_INDEX}}.r, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});
            #endif
            #ifdef MODE_PCF
                 col.rgb *= ShadowFactorPointPCF(
                    shadowMap{{LIGHT_INDEX}},
                    lightDirectionMOD{{LIGHT_INDEX}},
                    shadowMapDepth{{LIGHT_INDEX}},
                    cameraNear{{LIGHT_INDEX}},
                    cameraFar{{LIGHT_INDEX}},
                    bias{{LIGHT_INDEX}},
                    shadowStrength{{LIGHT_INDEX}},
                    modelPosMOD{{LIGHT_INDEX}}.xyz
                );
            #endif
            #ifdef MODE_POISSON
                #ifdef WEBGL1
                    FillPoissonArray();
                #endif

                 col.rgb *= ShadowFactorPointPoisson(shadowMap{{LIGHT_INDEX}}, lightDirectionMOD{{LIGHT_INDEX}}, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}});
            #endif

            #ifdef MODE_VSM
                 col.rgb *= ShadowFactorVSM(shadowMapSample{{LIGHT_INDEX}}, light{{LIGHT_INDEX}}.shadowProperties.BIAS, shadowMapDepth{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});
            #endif
        }
#endif