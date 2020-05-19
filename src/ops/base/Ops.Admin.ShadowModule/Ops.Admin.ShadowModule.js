const cgl = op.patch.cgl;
const LIGHT_TYPES = { point: 0, directional: 1, spot: 2 };
function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}


const inTrigger = op.inTrigger("Trigger In");
const inCastShadow = op.inBool("Cast Shadow", true);
const inReceiveShadow = op.inBool("Receive Shadow", false);
const algorithms = ['Default', 'PCF', 'Poisson', 'VSM'];
const inAlgorithm = op.inSwitch("Algorithm", algorithms, 'Default');
const inSamples = op.inSwitch("Samples", [1, 2, 4, 8], 4);
const inPoissonSpread = op.inFloat("Poisson Spread", 500);
inSamples.setUiAttribs({ greyout: true });
inPoissonSpread.setUiAttribs({ greyout: true });
op.setPortGroup("", [inCastShadow, inReceiveShadow]);
op.setPortGroup("Shadow Settings", [inAlgorithm, inSamples, inPoissonSpread]);

inReceiveShadow.onChange = () => {
    inAlgorithm.setUiAttribs({ greyout: !inReceiveShadow.get() });
    inSamples.setUiAttribs({ greyout: !inReceiveShadow.get() });
    if (shader) shader.toggleDefine("SHADOW_MAP", inReceiveShadow.get());
}

inAlgorithm.onChange = () => {
    if (!shader) return;
    const selectedAlgorithm = inAlgorithm.get();

    algorithms.forEach((algorithm) => {
        if (selectedAlgorithm === algorithm) {
            shader.define("MODE_" + algorithm.toUpperCase());

            if (selectedAlgorithm !== "Default" && selectedAlgorithm !== "VSM") {
                inSamples.setUiAttribs({ greyout: false });
                if (selectedAlgorithm === "Poisson") inPoissonSpread.setUiAttribs({ greyout: false });
                else inPoissonSpread.setUiAttribs({ greyout: true });
            } else {
                inSamples.setUiAttribs({ greyout: true });
                inPoissonSpread.setUiAttribs({ greyout: true });
            }
        }
        else shader.removeDefine("MODE_" + algorithm.toUpperCase());
    });

}

inSamples.onChange = () => {
    if (shader) shader.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");
}

const outTrigger = op.outTrigger("Trigger Out");


const createVertexHead = (n, type) => {
if (type === "point") return `
// VERTEX HEAD type: ${type} count: ${n}
#ifdef SHADOW_MAP
    OUT vec4 modelPosMOD${n};
#endif
`;
return `
// VERTEX HEAD type: ${type} count: ${n}
#ifdef SHADOW_MAP
    OUT vec4 modelPosMOD${n};
    UNI float normalOffset${n};
    UNI mat4 lightMatrix${n};
    OUT vec4 shadowCoord${n};
#endif
`;
};

const createVertexBody = (n, type) => {
    if (type === "point") return `
// VERTEX BODY type: ${type} count: ${n}
#ifdef SHADOW_MAP
    modelPosMOD${n} = mMatrix * pos;
#endif
`;
    return `
#ifdef SHADOW_MAP
    modelPosMOD${n} = mMatrix*pos;
    shadowCoord${n} = lightMatrix${n} * (modelPosMOD${n} + vec4(norm, 1) * normalOffset${n});
#endif
    `;
};

const createFragmentHead = (n, type) => {
    if (type === "ambient") return ""; //return `UNI Light modLight${n};`;
    return `
    // FRAGMENT HEAD type: ${type} count: ${n}
    UNI ModLight modLight${n};
    ${type !== "point" ? `
    #ifdef SHADOW_MAP
        IN vec4 shadowCoord${n};
    #endif` :`IN vec4 modelPosMOD${n};`}

    ${type === "point" ?  `UNI samplerCube shadowMap${n}; \n` : `UNI sampler2D shadowMap${n}; \n`}
    `;
};

const createFragmentBody = (n, type, shouldCastShadow) => {
    if (type === "ambient") return '';
    let fragmentCode = `// VERTEX HEAD type: ${type} count: ${n}`;

    if (inReceiveShadow.get()) {
        if (type === "spot") {
            // NOTE: no slope scaled depth bias because not all materials use lightDirection & lambert factor
            // float bias${n} = clamp(modLight${n}.shadowProperties.BIAS * tan(acos(lambert${n})), 0., 0.1);
            fragmentCode = fragmentCode.concat(`
    #ifdef SHADOW_MAP
        if (modLight${n}.typeCastShadow.CAST_SHADOW == 1) {

            vec2 shadowMapLookup${n} = shadowCoord${n}.xy / shadowCoord${n}.w;
            float shadowMapDepth${n} = shadowCoord${n}.z  / shadowCoord${n}.w;
            float shadowStrength${n} = modLight${n}.shadowStrength;
            vec2 shadowMapSample${n} = texture(shadowMap${n}, shadowMapLookup${n}).rg;
            float bias${n} = clamp(modLight${n}.shadowProperties.BIAS, 0., 1.);
            #ifdef MODE_DEFAULT
                 col.rgb *= ShadowFactorDefault(shadowMapSample${n}.r, shadowMapDepth${n}, bias${n}, shadowStrength${n});
            #endif

            #ifdef MODE_PCF
                 col.rgb *= ShadowFactorPCF(shadowMap${n}, shadowMapLookup${n}, modLight${n}.shadowProperties.MAP_SIZE, shadowMapDepth${n}, bias${n}, shadowStrength${n});
            #endif

            #ifdef MODE_POISSON
                #ifdef WEBGL1
                    FillPoissonArray();
                #endif

                 col.rgb *= ShadowFactorPoisson(shadowMap${n}, shadowMapLookup${n}, shadowMapDepth${n}, bias${n});
            #endif

            #ifdef MODE_VSM
                 col.rgb *= ShadowFactorVSM(shadowMapSample${n}, modLight${n}.shadowProperties.BIAS, shadowMapDepth${n}, shadowStrength${n});
            #endif
        }
    #endif
        `);
        }
        else if (type === "directional") {
            fragmentCode = fragmentCode.concat(`
    #ifdef SHADOW_MAP
        if (modLight${n}.typeCastShadow.CAST_SHADOW == 1) {
            vec2 shadowMapLookup${n} = shadowCoord${n}.xy / shadowCoord${n}.w;
            float shadowMapDepth${n} = shadowCoord${n}.z  / shadowCoord${n}.w;
            float shadowStrength${n} = modLight${n}.shadowStrength;
            vec2 shadowMapSample${n} = texture(shadowMap${n}, shadowMapLookup${n}).rg;
            float bias${n} = modLight${n}.shadowProperties.BIAS;

             #ifdef MODE_DEFAULT
                 col.rgb *= ShadowFactorDefault(shadowMapSample${n}.r, shadowMapDepth${n}, bias${n}, shadowStrength${n});
            #endif

            #ifdef MODE_PCF
                 col.rgb *= ShadowFactorPCF(shadowMap${n}, shadowMapLookup${n}, modLight${n}.shadowProperties.MAP_SIZE, shadowMapDepth${n}, bias${n}, shadowStrength${n});
            #endif

            #ifdef MODE_POISSON
                #ifdef WEBGL1
                    FillPoissonArray();
                #endif

                 col.rgb *= ShadowFactorPoisson(shadowMap${n}, shadowMapLookup${n}, shadowMapDepth${n}, bias${n});
            #endif

            #ifdef MODE_VSM
                 col.rgb *= ShadowFactorVSM(shadowMapSample${n}, modLight${n}.shadowProperties.BIAS, shadowMapDepth${n}, shadowStrength${n});
            #endif
        }
    #endif
            `);
        }
        else if (type === "point") {
            fragmentCode = fragmentCode.concat(`
    #ifdef SHADOW_MAP
        if (modLight${n}.typeCastShadow.CAST_SHADOW == 1) {
            vec3 lightDirection${n} = normalize(modLight${n}.position - modelPosMOD${n}.xyz);
            float shadowStrength${n} = modLight${n}.shadowStrength;

            float cameraNear${n} = modLight${n}.shadowProperties.NEAR; // uniforms
            float cameraFar${n} =  modLight${n}.shadowProperties.FAR;

            float fromLightToFrag${n} = (length(modelPosMOD${n}.xyz - modLight${n}.position) - cameraNear${n}) / (cameraFar${n} - cameraNear${n});

            float shadowMapDepth${n} = fromLightToFrag${n};
            float bias${n} = clamp(modLight${n}.shadowProperties.BIAS, 0., 1.);

            vec2 shadowMapSample${n} = textureCube(shadowMap${n}, -lightDirection${n}).rg;




            #ifdef MODE_DEFAULT
                 col.rgb *= ShadowFactorDefault(shadowMapSample${n}.r, shadowMapDepth${n}, bias${n}, shadowStrength${n});
            #endif
            #ifdef MODE_PCF
                 col.rgb *= ShadowFactorPointPCF(shadowMap${n}, lightDirection${n}, shadowMapDepth${n}, cameraNear${n}, cameraFar${n}, bias${n}, shadowStrength${n});
            #endif
            #ifdef MODE_POISSON
                #ifdef WEBGL1
                    FillPoissonArray();
                #endif

                 col.rgb *= ShadowFactorPointPoisson(shadowMap${n}, lightDirection${n}, shadowMapDepth${n}, bias${n});
            #endif

            #ifdef MODE_VSM
                 col.rgb *= ShadowFactorVSM(shadowMapSample${n}, modLight${n}.shadowProperties.BIAS, shadowMapDepth${n}, shadowStrength${n});
            #endif
        }
    #endif
        `);
        }
    }

    return fragmentCode;
};

let lastLength = 0;

function createModuleShaders(lightStack) {
    if (lightStack.length === lastLength) return;
        let vertexHead = "";
        let fragmentHead = "";
        let vertexBody = "";
        let fragmentBody = "";

    for (let i = 0; i < lightStack.length; i += 1) {
        const light = lightStack[i];
        vertexHead = vertexHead.concat(createVertexHead(i, light.type));
        vertexBody = vertexBody.concat(createVertexBody(i, light.type));

        fragmentHead = fragmentHead.concat(createFragmentHead(i, light.type));
        fragmentBody = fragmentBody.concat(createFragmentBody(i, light.type, light.castShadow));
    }

    srcHeadVert = srcHeadVertBase.concat(vertexHead);
    srcBodyVert = srcBodyVertBase.concat(vertexBody);
    srcHeadFrag = srcHeadFragBase.concat(fragmentHead);
    srcBodyFrag = srcBodyFragBase.concat(fragmentBody);

    lastLength = lightStack.length;
    createUniforms(lastLength);
}


let shader = null;
let vertexModule = null;
let fragmentModule = null;

const srcHeadVertBase = attachments.head_vert;
const srcBodyVertBase = "";
const srcHeadFragBase = attachments.head_frag;
const srcBodyFragBase = "";

let srcHeadVert = srcHeadVertBase;
let srcBodyVert = srcBodyVertBase;
let srcHeadFrag = srcHeadFragBase;
let srcBodyFrag = srcBodyFragBase;

let lightUniforms = [];
let uniformPoissonSpread = null;
function createUniforms(lightsCount) {
    if (!shader) return;
    lightUniforms = [];

    for (let i = 0; i < lightsCount; i += 1) {
        lightUniforms[i] = null;
        if (!lightUniforms[i]) {
            lightUniforms[i] = {
                position: new CGL.Uniform(shader,'3f','modLight' + i + '.position',[0, 0, 0]),
                typeCastShadow: new CGL.Uniform(shader, '2i', 'modLight' + i + '.typeCastShadow', [0, 0]),

                shadowProperties: new CGL.Uniform(shader, '4f', 'modLight' + i + '.shadowProperties', [0,0,0,0]),
                shadowStrength: new CGL.Uniform(shader, 'f', 'modLight' + i + '.shadowStrength', 1),

                shadowMap: null,

                // vertex shader
                normalOffset:  new CGL.Uniform(shader, 'f', 'normalOffset' + i, 0),
                lightMatrix:  new CGL.Uniform(shader,'m4', 'lightMatrix' + i, mat4.create()),
            };
        }
    }
    if (!uniformPoissonSpread) uniformPoissonSpread = new CGL.Uniform(shader, 'f', "poissonSpread", inPoissonSpread);
}

function setUniforms(lightStack) {
    const receiveShadow = inReceiveShadow.get();
    let castShadow = false;

    for (let i = 0; i < lightStack.length; i += 1) {
        const light = lightStack[i];
        if (light.type === "ambient") continue;
        lightUniforms[i].position.setValue([
            light.position[0],
            light.position[1],
            light.position[2],
        ]);
        lightUniforms[i].typeCastShadow.setValue([
            LIGHT_TYPES[light.type],
            light.castShadow,
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
            shader.pushTexture(lightUniforms[i].shadowMap, light.shadowMap.tex);
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

            shader.pushTexture(lightUniforms[i].shadowMap, light.shadowCubeMap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
        } else {
            if (lightUniforms[i].shadowMap) lightUniforms[i].shadowMap = null;
            if (lightUniforms[i].shadowCubeMap) lightUniforms[i].shadowMap = null;
        }
        castShadow = castShadow || light.castShadow;
        console.log("final cast shadow", castShadow);
        shader.toggleDefine("SHADOW_MAP", receiveShadow && castShadow);
        /*if (receiveShadow && castShadow) {
            if(!shader.hasDefine("SHADOW_MAP")) shader.define("SHADOW_MAP");
        }
        else {
            if (shader.hasDefine("SHADOW_MAP")) shader.removeDefine("SHADOW_MAP");
        }*/
    }

}


function updateShader() {
    const currentShader = cgl.getShader();

    if (currentShader && currentShader != shader || cgl.frameStore.lightStack.length !== lastLength) {

        removeModulesAndDefines();
        shader = currentShader;
        createModuleShaders(cgl.frameStore.lightStack);
        if (!shader.hasDefine("SHADOW_MAP")) {
            vertexModule = shader.addModule({
                name: 'MODULE_VERTEX_POSITION',
                title: op.objName,
                priority:-2,
                srcHeadVert: srcHeadVert,
                srcBodyVert: srcBodyVert
            });

            fragmentModule = shader.addModule({
                name: "MODULE_COLOR",
                priority: -2,
                title: op.objName,
                srcHeadFrag:srcHeadFrag,
                srcBodyFrag:srcBodyFrag,
            }, vertexModule);
            shader.define("SHADOW_MAP");
            shader.define("MODE_" + inAlgorithm.get().toUpperCase());
            shader.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");
        }
    }

    if (shader) {
        setUniforms(cgl.frameStore.lightStack);
    }
}

function removeModulesAndDefines() {
    if(shader && vertexModule) {
        shader.removeDefine('SHADOW_MAP');
        shader.removeDefine("MODE_" + inAlgorithm.get().toUpperCase());
        shader.removeModule(vertexModule);
        shader.removeModule(fragmentModule);
        shader = null;
    }
}
inTrigger.onLinkChanged = function() {
    if (!inTrigger.isLinked()) {
        removeModulesAndDefines();
        lastLength = 0;
    }
}

inTrigger.onTriggered = () => {
    if (!inCastShadow.get()) {
        if (!cgl.frameStore.shadowPass) {
            updateShader();
            outTrigger.trigger();
        }
        return;
    }

    if (!inReceiveShadow.get()) {
        outTrigger.trigger();
        return;
    }

    if (cgl.frameStore.shadowPass) {
        outTrigger.trigger();
        return;
    }

    if (!cgl.frameStore.lightStack) {
        outTrigger.trigger();
        return;
    }

    updateShader();
    outTrigger.trigger();
}
