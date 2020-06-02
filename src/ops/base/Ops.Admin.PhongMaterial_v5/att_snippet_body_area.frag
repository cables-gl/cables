// https://gist.github.com/jhermsmeier/4717033

/* void AreaLight(
    in int i,
    in vec3 N,
    in vec3 V,
    in float shininess,
    inout vec4 ambient,
    inout vec4 diffuse,
    inout vec4 specular
) { */
    vec3 right = normalize((mvMatrix * vec4(phongLight{{LIGHT_INDEX}}.right, 1.)).xyz);
    //normalize(vec3(mvMatrix * phongLight{{LIGHT_INDEX}}.right));
    // vec3 pnormal = normalize(phongLight{{LIGHT_INDEX}}.conePointAt);
    vec3 pnormal = normalize(phongLight{{LIGHT_INDEX}}.position - phongLight{{LIGHT_INDEX}}.conePointAt);
    vec3 up = normalize(cross(right,pnormal));

    //width and height of the area light:
    float width = phongLight{{LIGHT_INDEX}}.width;
    float height = phongLight{{LIGHT_INDEX}}.height;

    //project onto plane and calculate direction from center to the projection.
    vec3 projection = ProjectOnPlane(-viewDirection, vec3(phongLight{{LIGHT_INDEX}}.position), pnormal);// projection in plane
    vec3 dir = projection - vec3(phongLight{{LIGHT_INDEX}}.position);

    //calculate distance from area:
    vec2 diagonal = vec2(dot(dir, right), dot(dir, up));
    vec2 nearest2D = vec2(
        clamp(diagonal.x, -width, width),
        clamp(diagonal.y, -height, height)
    );
    vec3 nearestPointInside = phongLight{{LIGHT_INDEX}}.position + (right * nearest2D.x + up * nearest2D.y);

    float dist = distance(viewDirection, nearestPointInside);//real distance to area rectangle

    vec3 L = normalize(nearestPointInside - viewDirection);
    float attenuation = 1.; // CalculateFalloffArea(dist, phongLight{{LIGHT_INDEX}}.lightProperties.FALLOFF);

    float nDotL = dot(pnormal, L); // actually -L
    vec3 diffuseColor{{LIGHT_INDEX}} = vec3(1.);
    vec3 specularColor{{LIGHT_INDEX}} = vec3(0.);
    diffuseColor{{LIGHT_INDEX}} = baseColor * phongLight{{LIGHT_INDEX}}.color * attenuation * nDotL;
    // looking at the plane
    if (nDotL > 0.0 && SideOfPlane(viewDirection, phongLight{{LIGHT_INDEX}}.position, pnormal) == 1) {
        //shoot a ray to calculate specular:
        vec3 R = reflect(normalize(viewDirection), normal);
        vec3 E = LinePlaneIntersect(
            viewDirection,
            R,
            phongLight{{LIGHT_INDEX}}.position,
            pnormal
        );

        float specAngle = dot(R, pnormal);

        if (specAngle > 0.0) {
            vec3 dirSpec = phongLight{{LIGHT_INDEX}}.position - E;
    	    vec2 dirSpec2D = vec2(dot(dirSpec, right), dot(dirSpec, up));
            vec2 nearestSpec2D = vec2(
                clamp(dirSpec2D.x, -width, width),
                clamp(dirSpec2D.y, -height, height)
            );
    	    float specFactor = 1.0 - clamp(length(nearestSpec2D - dirSpec2D) * inMaterialProperties.SHININESS, 0.0, 1.0);
            specularColor{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.specular * baseColor * attenuation * specFactor * specAngle;
            calculatedColor += vec3(0.,1.,0.);
        }
        // diffuseColor{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.color * attenuation * nDotL;
    }

    vec3 combinedColor{{LIGHT_INDEX}} = (diffuseColor{{LIGHT_INDEX}} + specularColor{{LIGHT_INDEX}});
    calculatedColor += combinedColor{{LIGHT_INDEX}}; // combinedColor{{LIGHT_INDEX}};
    // ambient  += phongLight{{LIGHT_INDEX}}.ambient * attenuation;
// }

/*
    // * SPOT LIGHT {{LIGHT_INDEX}} *
    vec3 phongLightDirection{{LIGHT_INDEX}} = normalize(phongLight{{LIGHT_INDEX}}.position - fragPos.xyz);

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

    vec3 diffuseColor{{LIGHT_INDEX}} = CalculateDiffuseColor(phongLightDirection{{LIGHT_INDEX}}, normal, lightColor{{LIGHT_INDEX}}, baseColor, phongLambert{{LIGHT_INDEX}});
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
    combinedColor{{LIGHT_INDEX}} *= CalculateFalloff(phongLightDirection{{LIGHT_INDEX}}, phongLight{{LIGHT_INDEX}}.lightProperties.FALLOFF);

    combinedColor{{LIGHT_INDEX}} *= phongLight{{LIGHT_INDEX}}.lightProperties.INTENSITY;
    calculatedColor += combinedColor{{LIGHT_INDEX}};
    */