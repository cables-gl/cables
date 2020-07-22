// FRAGMENT BODY type: POINT count: {{LIGHT_INDEX}}
 #ifdef HAS_SHADOW_MAP_{{LIGHT_INDEX}}
        if (MOD_light{{LIGHT_INDEX}}.typeCastShadow.CAST_SHADOW == 1) {
            vec3 lightDirectionMOD{{LIGHT_INDEX}} = normalize(MOD_light{{LIGHT_INDEX}}.position - MOD_modelPos{{LIGHT_INDEX}}.xyz);
            float shadowStrength{{LIGHT_INDEX}} = MOD_light{{LIGHT_INDEX}}.shadowStrength;

            float cameraNear{{LIGHT_INDEX}} = MOD_light{{LIGHT_INDEX}}.shadowProperties.NEAR; // uniforms
            float cameraFar{{LIGHT_INDEX}} =  MOD_light{{LIGHT_INDEX}}.shadowProperties.FAR;

            float fromLightToFrag{{LIGHT_INDEX}} = (length(MOD_modelPos{{LIGHT_INDEX}}.xyz - MOD_light{{LIGHT_INDEX}}.position) - cameraNear{{LIGHT_INDEX}}) / (cameraFar{{LIGHT_INDEX}} - cameraNear{{LIGHT_INDEX}});

            float shadowMapDepth{{LIGHT_INDEX}} = fromLightToFrag{{LIGHT_INDEX}};
            // float bias{{LIGHT_INDEX}} = clamp(MOD_light{{LIGHT_INDEX}}.shadowProperties.BIAS, 0., 1.);
            float lambert{{LIGHT_INDEX}} = clamp(dot(lightDirectionMOD{{LIGHT_INDEX}}, normalize(MOD_normal{{LIGHT_INDEX}})), 0., 1.);
            float bias{{LIGHT_INDEX}} = clamp(MOD_light{{LIGHT_INDEX}}.shadowProperties.BIAS * tan(acos(lambert{{LIGHT_INDEX}})), 0., 0.1);
            vec2 shadowMapSample{{LIGHT_INDEX}} = textureCube(MOD_shadowMapCube{{LIGHT_INDEX}}, -lightDirectionMOD{{LIGHT_INDEX}}).rg;




            #ifdef MODE_DEFAULT
                float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorDefault(shadowMapSample{{LIGHT_INDEX}}.r, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});
                MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);
                vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);
                col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);
            #endif
            #ifdef MODE_PCF
                 float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorPointPCF(
                    MOD_shadowMapCube{{LIGHT_INDEX}},
                    lightDirectionMOD{{LIGHT_INDEX}},
                    shadowMapDepth{{LIGHT_INDEX}},
                    cameraNear{{LIGHT_INDEX}},
                    cameraFar{{LIGHT_INDEX}},
                    bias{{LIGHT_INDEX}},
                    shadowStrength{{LIGHT_INDEX}},
                    MOD_modelPos{{LIGHT_INDEX}}.xyz,
                    MOD_camPos,
                    MOD_sampleSpread
                );
                MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);
                vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);
                col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);
            #endif
            #ifdef MODE_POISSON
                #ifdef WEBGL1
                    FillPoissonArray();
                #endif

                float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorPointPoisson(MOD_shadowMapCube{{LIGHT_INDEX}}, lightDirectionMOD{{LIGHT_INDEX}}, shadowMapDepth{{LIGHT_INDEX}}, bias{{LIGHT_INDEX}}, MOD_sampleSpread);
                MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);
                vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);
                col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);
            #endif

            #ifdef MODE_VSM
                float MOD_shadowFactor{{LIGHT_INDEX}} = MOD_ShadowFactorVSM(shadowMapSample{{LIGHT_INDEX}}, MOD_light{{LIGHT_INDEX}}.shadowProperties.BIAS, shadowMapDepth{{LIGHT_INDEX}}, shadowStrength{{LIGHT_INDEX}});
                MOD_shadowFactor{{LIGHT_INDEX}} = clamp((MOD_shadowFactor{{LIGHT_INDEX}} + ((1. - shadowStrength{{LIGHT_INDEX}}))), 0., 1.);
                vec3 MOD_shadowColor{{LIGHT_INDEX}} = (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);
                col.rgb -= (1. - MOD_shadowFactor{{LIGHT_INDEX}}) * (vec3(1.) - MOD_shadowColor);
            #endif
        }
#endif
