function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

const execute = op.inTrigger("execute");
const r = op.inValueSlider("diffuse r", Math.random());
const g = op.inValueSlider("diffuse g", Math.random());
const b = op.inValueSlider("diffuse b", Math.random());
const a = op.inValueSlider("diffuse a", 1.0);
r.setUiAttribs({ colorPick: true });

const inToggleDoubleSided = op.inBool("Double Sided", false);

const inShadow = op.inBool("Receive Shadow", false);
inToggleDoubleSided.onChange = function () {
    shader.toggleDefine("DOUBLE_SIDED", inToggleDoubleSided.get());
};
let recompileShader = false;

inShadow.onChange = function() {
    recompileShader = true;
    if (inShadow.get()) shader.define("SHADOW_MAP")
    else shader.removeDefine("SHADOW_MAP");

    inAlgorithm.setUiAttribs({ greyout: !inShadow.get() });
    inSamples.setUiAttribs({ greyout: !inShadow.get() });
    if (inAlgorithm.get() === "Poisson") inPoissonSpread.setUiAttribs({ greyout: !inShadow.get() });
}

const algorithms = ['Default', 'PCF', 'Poisson', 'VSM'];
const inAlgorithm = op.inSwitch("Algorithm", algorithms, 'Default');
const inSamples = op.inSwitch("Samples", [1, 2, 4, 8], 4);
const inPoissonSpread = op.inFloat("Poisson Spread", 500);
inSamples.setUiAttribs({ greyout: true });
inPoissonSpread.setUiAttribs({ greyout: true });
op.setPortGroup("", [inShadow]);
op.setPortGroup("Shadow Settings", [inAlgorithm, inSamples, inPoissonSpread]);

inAlgorithm.onChange = function() {
    const selectedAlgorithm = inAlgorithm.get();
    algorithms.forEach(function(algorithm) {
        if (selectedAlgorithm === algorithm) {
            shader.define("MODE_" + algorithm.toUpperCase());
            if (algorithm !== "Default" && algorithm !== "VSM") {
                inSamples.setUiAttribs({ greyout: false });
                algorithm === "Poisson" && inPoissonSpread.setUiAttribs({ greyout: false });
            } else {
                inSamples.setUiAttribs({ greyout: true });
                inPoissonSpread.setUiAttribs({ greyout: true });
            }
        }
        else shader.removeDefine("MODE_" + algorithm.toUpperCase());
    });

}

const next = op.outTrigger("next");


const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,"LambertMaterial");
shader.define("MODE_DEFAULT");
shader.define('NUM_LIGHTS','1');

const IS_WEBGL_1 = cgl.glVersion == 1;
if (IS_WEBGL_1) {
    /* these are enabled by default
    cgl.gl.getExtension('OES_texture_float');
    cgl.gl.getExtension('OES_texture_float_linear');
    cgl.gl.getExtension('OES_texture_half_float');
    cgl.gl.getExtension('OES_texture_half_float_linear');
    */
    shader.enableExtension("GL_OES_standard_derivatives");
    // NOTE: these are implicitly enabled:
    //shader.enableExtension("GL_OES_texture_float");
    //shader.enableExtension("GL_OES_texture_float_linear");
    //shader.enableExtension("GL_OES_texture_half_float");
    //shader.enableExtension("GL_OES_texture_half_float_linear");
}

inSamples.onChange = function() {
    shader.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");
}
shader.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");

const colUni = new CGL.Uniform(shader,'4f','materialColor',r,g,b,a);
const uniformPoissonSpread = new CGL.Uniform(shader, 'f', 'poissonSpread', inPoissonSpread);

const outShader = op.outObject("Shader");
outShader.set(shader);

const MAX_UNIFORM_FRAGMENTS = cgl.gl.getParameter(cgl.gl.MAX_FRAGMENT_UNIFORM_VECTORS);
const MAX_UNIFORM_VERTEX = cgl.gl.getParameter(cgl.gl.MAX_VERTEX_UNIFORM_VECTORS);

const MAX_LIGHTS = MAX_UNIFORM_FRAGMENTS === 64 ? 2 : 16;
const MAX_TEXTURE_UNITS = cgl.gl.getParameter(cgl.gl.MAX_TEXTURE_IMAGE_UNITS);
const MAX_TEXTURE_SLOT = MAX_TEXTURE_UNITS - 1;


const createVertexHead = (n, type) => {
if (type === "point") return '';
return `
#ifdef SHADOW_MAP
    UNI float normalOffset${n};
    UNI mat4 lightMatrix${n};
    OUT vec4 shadowCoord${n};
#endif
`;
};

const createVertexBody = (n, type) => {
    if (type === "point") return '';
    return `
#ifdef SHADOW_MAP
    shadowCoord${n} = lightMatrix${n} * (modelPos + vec4(norm, 1) * normalOffset${n});
#endif
    `;
};

const DEFAULT_FRAGMENT_HEAD = `
UNI Light light0;
`;

const DEFAULT_FRAGMENT_BODY = `
// DEFAULT_LIGHT
vec3 lightDirection0 = normalize(light0.position - modelPos.xyz);
float lambert0 = 1.; // inout variable
vec3 diffuseColor0 = CalculateDiffuseColor(lightDirection0, normal, light0.color, materialColor.rgb, lambert0);
diffuseColor0 *= light0.lightProperties.INTENSITY;

calculatedColor += diffuseColor0;
`;

const createFragmentHead = (n, type) => {
    if (type === "ambient") return `UNI Light light${n};`;
    return `
    ${type !== "point" ? `
    #ifdef SHADOW_MAP
        IN vec4 shadowCoord${n};
    #endif` : ''}
    UNI Light light${n};
    ${type === "point" ?  `UNI samplerCube shadowMap${n}; \n` : `UNI sampler2D shadowMap${n}; \n`}
    `;
};

const createFragmentBody = (n, type, shouldCastShadow) => {
    if (type === "ambient") {
        return `
    // ${type.toUpperCase()} LIGHT
    vec3 diffuseColor${n} = light${n}.lightProperties.INTENSITY*light${n}.color;
    calculatedColor += diffuseColor${n};
    `;
    }
    let fragmentCode = `
    // ${type.toUpperCase()} LIGHT
    vec3 lightDirection${n} = ${type !== "directional" ?
        `normalize(light${n}.position - modelPos.xyz)`
        : `light${n}.position`};

    float lambert${n} = 1.; // inout variable
    vec3 diffuseColor${n} = CalculateDiffuseColor(lightDirection${n}, normal, light${n}.color, materialColor.rgb, lambert${n});

    ${type === "spot" ? `
        float spotIntensity${n} = CalculateSpotLightEffect(
            light${n}.position, light${n}.conePointAt, light${n}.spotProperties.COSCONEANGLE,
            light${n}.spotProperties.COSCONEANGLEINNER, light${n}.spotProperties.SPOTEXPONENT,
            lightDirection${n}
        );
        diffuseColor${n} *= spotIntensity${n};
    ` : ''}

    ${type !== "directional" ? `
    vec3 lightModelDiff${n} = light${n}.position - modelPos.xyz;
    diffuseColor${n} *= CalculateFalloff(
        light${n}.lightProperties.RADIUS,
        light${n}.lightProperties.FALLOFF,
        length(lightModelDiff${n})
    );
    ` : ''}
    `;

    if (inShadow.get()) {
        if (type === "spot") {
            fragmentCode = fragmentCode.concat(`
    #ifdef SHADOW_MAP
        if (light${n}.typeCastShadow.CAST_SHADOW == 1) {

            vec2 shadowMapLookup${n} = shadowCoord${n}.xy / shadowCoord${n}.w;
            float shadowMapDepth${n} = shadowCoord${n}.z  / shadowCoord${n}.w;
            float shadowStrength${n} = light${n}.shadowStrength;
            vec2 shadowMapSample${n} = texture(shadowMap${n}, shadowMapLookup${n}).rg;
            float bias${n} = clamp(light${n}.shadowProperties.BIAS * tan(acos(lambert${n})), 0., 0.1);

            #ifdef MODE_DEFAULT
                diffuseColor${n} *= ShadowFactorDefault(shadowMapSample${n}.r, shadowMapDepth${n}, bias${n}, shadowStrength${n});
            #endif

            #ifdef MODE_PCF
                diffuseColor${n} *= ShadowFactorPCF(shadowMap${n}, shadowMapLookup${n}, light${n}.shadowProperties.MAP_SIZE, shadowMapDepth${n}, bias${n}, shadowStrength${n});
            #endif

            #ifdef MODE_POISSON
                #ifdef WEBGL1
                    FillPoissonArray();
                #endif

                diffuseColor${n} *= ShadowFactorPoisson(shadowMap${n}, shadowMapLookup${n}, shadowMapDepth${n}, bias${n});
            #endif

            #ifdef MODE_VSM
                diffuseColor${n} *= ShadowFactorVSM(shadowMapSample${n}, light${n}.shadowProperties.BIAS, shadowMapDepth${n}, shadowStrength${n});
            #endif
        }
    #endif
        `);
        }
        else if (type === "directional") {
            fragmentCode = fragmentCode.concat(`
    #ifdef SHADOW_MAP
        if (light${n}.typeCastShadow.CAST_SHADOW == 1) {
            vec2 shadowMapLookup${n} = shadowCoord${n}.xy / shadowCoord${n}.w;
            float shadowMapDepth${n} = shadowCoord${n}.z  / shadowCoord${n}.w;
            float shadowStrength${n} = light${n}.shadowStrength;
            vec2 shadowMapSample${n} = texture(shadowMap${n}, shadowMapLookup${n}).rg;
            float bias${n} = light${n}.shadowProperties.BIAS;

             #ifdef MODE_DEFAULT
                diffuseColor${n} *= ShadowFactorDefault(shadowMapSample${n}.r, shadowMapDepth${n}, bias${n}, shadowStrength${n});
            #endif

            #ifdef MODE_PCF
                diffuseColor${n} *= ShadowFactorPCF(shadowMap${n}, shadowMapLookup${n}, light${n}.shadowProperties.MAP_SIZE, shadowMapDepth${n}, bias${n}, shadowStrength${n});
            #endif

            #ifdef MODE_POISSON
                #ifdef WEBGL1
                    FillPoissonArray();
                #endif

                diffuseColor${n} *= ShadowFactorPoisson(shadowMap${n}, shadowMapLookup${n}, shadowMapDepth${n}, bias${n});
            #endif

            #ifdef MODE_VSM
                diffuseColor${n} *= ShadowFactorVSM(shadowMapSample${n}, light${n}.shadowProperties.BIAS, shadowMapDepth${n}, shadowStrength${n});
            #endif
        }
    #endif
            `);
        }
        else if (type === "point") {
            fragmentCode = fragmentCode.concat(`
    #ifdef SHADOW_MAP
        if (light${n}.typeCastShadow.CAST_SHADOW == 1) {
            float shadowStrength${n} = light${n}.shadowStrength;

            float cameraNear${n} = light${n}.shadowProperties.NEAR; // uniforms
            float cameraFar${n} =  light${n}.shadowProperties.FAR;

            float fromLightToFrag${n} = (length(modelPos.xyz - light${n}.position) - cameraNear${n}) / (cameraFar${n} - cameraNear${n});

            float shadowMapDepth${n} = fromLightToFrag${n};
            float bias${n} = clamp(light${n}.shadowProperties.BIAS * tan(acos(lambert${n})), 0., 0.1);

            vec2 shadowMapSample${n} = textureCube(shadowMap${n}, -lightDirection${n}).rg;




            #ifdef MODE_DEFAULT
                diffuseColor${n} *= ShadowFactorDefault(shadowMapSample${n}.r, shadowMapDepth${n}, bias${n}, shadowStrength${n});
            #endif
            #ifdef MODE_PCF
                diffuseColor${n} *= ShadowFactorPointPCF(shadowMap${n}, lightDirection${n}, shadowMapDepth${n}, cameraNear${n}, cameraFar${n}, bias${n}, shadowStrength${n});
            #endif
            #ifdef MODE_POISSON
                #ifdef WEBGL1
                    FillPoissonArray();
                #endif

                diffuseColor${n} *= ShadowFactorPointPoisson(shadowMap${n}, lightDirection${n}, shadowMapDepth${n}, bias${n});
            #endif

            #ifdef MODE_VSM
                diffuseColor${n} *= ShadowFactorVSM(shadowMapSample${n}, light${n}.shadowProperties.BIAS, shadowMapDepth${n}, shadowStrength${n});
            #endif
        }
    #endif
        `);
        }
    }
    fragmentCode = fragmentCode.concat(`
    diffuseColor${n} *= light${n}.lightProperties.INTENSITY;
    calculatedColor += diffuseColor${n};
    `);
    return fragmentCode;
};

function createDefaultShader() {
    let vertexShader = attachments.lambert_vert;
    let fragmentShader = attachments.lambert_frag;
    fragmentShader = fragmentShader.replace("//{SHADOW_FRAGMENT_HEAD}", DEFAULT_FRAGMENT_HEAD);
    fragmentShader = fragmentShader.replace("//{SHADOW_FRAGMENT_BODY}", DEFAULT_FRAGMENT_BODY);
    shader.setSource(vertexShader, fragmentShader);
}

let defaultUniform = null;

function createDefaultUniform() {
    defaultUniform = {
        color: new CGL.Uniform(shader,'3f','light' + 0 + '.color', [1,1,1]),
        position: new CGL.Uniform(shader,'3f','light' + 0 + '.position',[0,11,0]),

        // intensity, attenuation, falloff, radius
        lightProperties: new CGL.Uniform(shader, '4f', 'light' + 0 + '.lightProperties', [1,1,1,1]),
        typeCastShadow: new CGL.Uniform(shader, '2i', 'light' + 0 + '.typeCastShadow', [0, 0]),
        castShadow: new CGL.Uniform(shader,'i','light' + 0 + '.castShadow', 0),


        conePointAt: new CGL.Uniform(shader,'3f','light' + 0 + '.conePointAt', vec3.create()),
        spotProperties: new CGL.Uniform(shader, '3f', 'light' + 0 + '.spotProperties', [0,0,0,0]),

        shadowProperties: new CGL.Uniform(shader, '4f', 'light' + 0 + '.shadowProperties', [0,0,0,0]),
        shadowStrength: new CGL.Uniform(shader, 'f', 'light' + 0 + '.shadowStrength', 1),

        shadowMap:  null,

        // vertex shader
        normalOffset:  new CGL.Uniform(shader, 'f', 'normalOffset' + 0, 0),
        lightMatrix:  new CGL.Uniform(shader,'m4','lightMatrix' + 0, mat4.create()),
    }
}

function setDefaultUniform(light) {
        defaultUniform.position.setValue(light.position);
        defaultUniform.color.setValue(light.color);

        defaultUniform.lightProperties.setValue([
            light.intensity,
            light.attenuation,
            light.falloff,
            light.radius,
        ]);
        defaultUniform.typeCastShadow.setValue([
            LIGHT_TYPES[light.type],
            light.castShadow,
        ]);

        defaultUniform.castShadow.setValue(Number(light.castShadow));
        defaultUniform.conePointAt.setValue(light.conePointAt);
        defaultUniform.spotProperties.setValue([
            light.cosConeAngle,
            light.cosConeAngleInner,
            light.spotExponent,
        ]);
}

function createShader(lightStack) {
    let vertexShader = attachments.lambert_vert;
    let fragmentShader = attachments.lambert_frag;

    let vertexHead = '';
    let vertexBody = '';

    let fragmentHead = '';
    let fragmentBody = '';

    for (let i = 0; i < lightStack.length; i += 1) {
        const light = lightStack[i];
        vertexHead = vertexHead.concat(createVertexHead(i, light.type));
        vertexBody = vertexBody.concat(createVertexBody(i, light.type));

        fragmentHead = fragmentHead.concat(createFragmentHead(i, light.type));
        fragmentBody = fragmentBody.concat(createFragmentBody(i, light.type, light.castShadow));
    }

    vertexShader = vertexShader.replace("//{SHADOW_VERTEX_HEAD}", vertexHead);
    vertexShader = vertexShader.replace("//{SHADOW_VERTEX_BODY}", vertexBody);

    fragmentShader = fragmentShader.replace("//{SHADOW_FRAGMENT_HEAD}", fragmentHead);
    fragmentShader = fragmentShader.replace("//{SHADOW_FRAGMENT_BODY}", fragmentBody);

    shader.setSource(vertexShader, fragmentShader);

}

const lightUniforms = [];
let oldCount = 0;

function createUniforms(lightsCount) {
    for (let i = 0; i < lightUniforms.length; i += 1) {
        lightUniforms[i] = null;
    }

    for (let i = 0; i < lightsCount; i += 1) {
        lightUniforms[i] = null;
        if (!lightUniforms[i]) {
            lightUniforms[i] = {
                color: new CGL.Uniform(shader,'3f','light' + i + '.color', [1,1,1]),
                position: new CGL.Uniform(shader,'3f','light' + i + '.position',[0,11,0]),

                // intensity, attenuation, falloff, radius
                lightProperties: new CGL.Uniform(shader, '4f', 'light' + i + '.lightProperties', [1,1,1,1]),
                typeCastShadow: new CGL.Uniform(shader, '2i', 'light' + i + '.typeCastShadow', [0, 0]),
                castShadow: new CGL.Uniform(shader,'i','light' + i + '.castShadow', 0),


                conePointAt: new CGL.Uniform(shader,'3f','light' + i + '.conePointAt', vec3.create()),
                spotProperties: new CGL.Uniform(shader, '3f', 'light' + i + '.spotProperties', [0,0,0,0]),

                shadowProperties: new CGL.Uniform(shader, '4f', 'light' + i + '.shadowProperties', [0,0,0,0]),
                shadowStrength: new CGL.Uniform(shader, 'f', 'light' + i + '.shadowStrength', 1),

                shadowMap:  null,

                // vertex shader
                normalOffset:  new CGL.Uniform(shader, 'f', 'normalOffset' + i, 0),
                lightMatrix:  new CGL.Uniform(shader,'m4','lightMatrix' + i, mat4.create()),
            };
        }
    }
}

function setUniforms(lightStack) {
    const receiveShadow = inShadow.get();
    let castShadow = false;

    for (let i = 0; i < lightStack.length; i += 1) {
        const light = lightStack[i];
        lightUniforms[i].position.setValue(light.position);
        lightUniforms[i].color.setValue(light.color);

        lightUniforms[i].lightProperties.setValue([
            light.intensity,
            light.attenuation,
            light.falloff,
            light.radius,
        ]);
        lightUniforms[i].typeCastShadow.setValue([
            LIGHT_TYPES[light.type],
            light.castShadow,
        ]);

        lightUniforms[i].castShadow.setValue(Number(light.castShadow));
        lightUniforms[i].conePointAt.setValue(light.conePointAt);
        lightUniforms[i].spotProperties.setValue([
            light.cosConeAngle,
            light.cosConeAngleInner,
            light.spotExponent,
        ]);

        if (light.shadowMap) {
            lightUniforms[i].lightMatrix.setValue(light.lightMatrix);
            lightUniforms[i].normalOffset.setValue(light.normalOffset);
            lightUniforms[i].shadowProperties.setValue([
                light.nearFar[0],
                light.nearFar[1],
                light.shadowMap.width,
                light.shadowBias
            ]);
            lightUniforms[i].shadowStrength.setValue(light.shadowStrength);

            if (!lightUniforms[i].shadowMap) {
                lightUniforms[i].shadowMap = new CGL.Uniform(shader, 't', 'shadowMap' + i, i);
            }
            //shader.pushTexture(lightUniforms[i].shadowMap, light.shadowMap.tex);

            cgl.setTexture(i, light.shadowMap.tex);
        } else if (light.shadowCubeMap) {
             lightUniforms[i].shadowProperties.setValue([
                light.nearFar[0],
                light.nearFar[1],
                light.shadowCubeMap.width,
                light.shadowBias
            ]);
            lightUniforms[i].shadowStrength.setValue(light.shadowStrength);

            if (!lightUniforms[i].shadowMap) {
                lightUniforms[i].shadowMap = new CGL.Uniform(shader, 't', 'shadowMap' + i, i);
            }
            //shader.pushTexture(lightUniforms[i].shadowMap, light.shadowCubeMap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);

            cgl.setTexture(i, light.shadowCubeMap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
        } else {
            if (lightUniforms[i].shadowMap) lightUniforms[i].shadowMap = null;
            if (lightUniforms[i].shadowCubeMap) lightUniforms[i].shadowMap = null;
        }
        castShadow = castShadow || light.castShadow;
        if (receiveShadow && castShadow) {
            if(!shader.hasDefine("SHADOW_MAP")) shader.define("SHADOW_MAP");
        }
        else {
            if (!shader.hasDefine("SHADOW_MAP")) shader.removeDefine("SHADOW_MAP");
        }
    }

}

function compareLights(lightStack) {
    if (lightStack.length !== oldCount) {
        createShader(lightStack);
        createUniforms(lightStack.length);
        oldCount = lightStack.length;
        setUniforms(lightStack);
        recompileShader = false;
    } else {
        if (recompileShader) {
            createShader(lightStack);
            createUniforms(lightStack.length);
            recompileShader = false;
        }
        setUniforms(lightStack);
        return;
    }
}


const LIGHT_TYPES = { point: 0, directional: 1, spot: 2 };
const inverseViewMat = mat4.create();
const camPos = vec3.create();

const DEFAULT_LIGHTSTACK = [{
   type: "point",
   position: [5, 5, 5],
   intensity: 1,
   attenuation: 0,
   falloff: 0.5,
   radius: 80,
   castShadow: false,
   shadowMap: null,
}];


function updateLights() {
    if((!cgl.frameStore.lightStack || !cgl.frameStore.lightStack.length)) {
        // if no light in light stack, use default light & set count to -1
        // so when a new light gets added, the shader does recompile
        if (shader.hasDefine("SHADOW_MAP")) shader.removeDefine("SHADOW_MAP");
        if (!defaultUniform) {
            createDefaultShader();
            createDefaultUniform();
        }
        setDefaultUniform(DEFAULT_LIGHTSTACK[0]);
        oldCount = -1;

    } else {
        if(shader) {
            if (cgl.frameStore.lightStack) {
                if (cgl.frameStore.lightStack.length) {
                        defaultUniform = null;
                        compareLights(cgl.frameStore.lightStack);
                        return;
                    }
                }
        }
    }
};

execute.onTriggered=function()
{
    if(!shader) {
        console.log("lambert has no shader...");
        return;
    }
    if (cgl.shadowPass) {
        next.trigger();
    } else {
        cgl.setShader(shader);

        shader.popTextures();

        updateLights();
        next.trigger();

        cgl.setPreviousShader();
    }
};
