    // * SPOT LIGHT {{LIGHT_INDEX}} *
    if (phongLight{{LIGHT_INDEX}}.castLight == 1) {
        vec3 phongLightDirection{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.position - fragPos.xyz;
        phongLightDirection{{LIGHT_INDEX}} = normalize( phongLightDirection{{LIGHT_INDEX}});
        float phongLightDistance{{LIGHT_INDEX}} = length(phongLightDirection{{LIGHT_INDEX}});

        float phongLambert{{LIGHT_INDEX}} = 1.; // inout variable

        vec3 lightColor{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.color;
        vec3 lightSpecular{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.specular;

        #ifdef HAS_TEXTURES
            #ifdef HAS_TEXTURE_AO
                lightColor{{LIGHT_INDEX}} *= mix(vec3(1.), texture(texAO, texCoord).rgb, inTextureIntensities.AO);
            #endif

            #ifdef HAS_TEXTURE_SPECULAR
                lightSpecular{{LIGHT_INDEX}} *= mix(1., texture(texSpecular, texCoord).r, inTextureIntensities.SPECULAR);
            #endif
        #endif

        vec3 diffuseColor{{LIGHT_INDEX}} = CalculateDiffuseColor(phongLightDirection{{LIGHT_INDEX}}, viewDirection, normal, lightColor{{LIGHT_INDEX}}, baseColor, phongLambert{{LIGHT_INDEX}});
        vec3 specularColor{{LIGHT_INDEX}} = CalculateSpecularColor(
            lightSpecular{{LIGHT_INDEX}},
            inMaterialProperties.SPECULAR_AMT,
            inMaterialProperties.SHININESS,
            phongLightDirection{{LIGHT_INDEX}},
            viewDirection,
            normal,
            phongLambert{{LIGHT_INDEX}}
        );

        vec3 combinedColor{{LIGHT_INDEX}} = (diffuseColor{{LIGHT_INDEX}} + specularColor{{LIGHT_INDEX}});

        float spotIntensity{{LIGHT_INDEX}} = CalculateSpotLightEffect(
            phongLight{{LIGHT_INDEX}}.position, phongLight{{LIGHT_INDEX}}.conePointAt, phongLight{{LIGHT_INDEX}}.spotProperties.COSCONEANGLE,
            phongLight{{LIGHT_INDEX}}.spotProperties.COSCONEANGLEINNER, phongLight{{LIGHT_INDEX}}.spotProperties.SPOTEXPONENT,
            phongLightDirection{{LIGHT_INDEX}}
        );

        combinedColor{{LIGHT_INDEX}} *= spotIntensity{{LIGHT_INDEX}};

        vec3 lightModelDiff{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.position - fragPos.xyz;

        float attenuation{{LIGHT_INDEX}} = CalculateFalloff(
            phongLightDistance{{LIGHT_INDEX}},
            phongLightDirection{{LIGHT_INDEX}},
            phongLight{{LIGHT_INDEX}}.lightProperties.FALLOFF,
            phongLight{{LIGHT_INDEX}}.lightProperties.RADIUS
        );

        attenuation{{LIGHT_INDEX}} *= when_gt(phongLambert{{LIGHT_INDEX}}, 0.);

        combinedColor{{LIGHT_INDEX}} *= attenuation{{LIGHT_INDEX}};

        combinedColor{{LIGHT_INDEX}} *= phongLight{{LIGHT_INDEX}}.lightProperties.INTENSITY;
        calculatedColor += combinedColor{{LIGHT_INDEX}};
    }