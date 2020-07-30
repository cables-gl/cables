    // * AMBIENT LIGHT {{LIGHT_INDEX}} *
    vec3 diffuseColor{{LIGHT_INDEX}} = phongLight{{LIGHT_INDEX}}.lightProperties.INTENSITY*phongLight{{LIGHT_INDEX}}.color;
    calculatedColor += diffuseColor{{LIGHT_INDEX}};
