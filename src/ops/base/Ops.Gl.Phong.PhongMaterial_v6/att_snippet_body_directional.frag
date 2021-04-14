    // * DIRECTIONAL LIGHT {{LIGHT_INDEX}} *

    if (phongLight{{LIGHT_INDEX}}.castLight == 1) {
        vec3 phongLightDirection{{LIGHT_INDEX}} = normalize(phongLight{{LIGHT_INDEX}}.position);

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

        vec3 lightModelDiff{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.position - fragPos.xyz;

        combinedColor{{LIGHT_INDEX}} *= phongLight{{LIGHT_INDEX}}.lightProperties.INTENSITY;
        calculatedColor += combinedColor{{LIGHT_INDEX}};
    }