const cgl = op.patch.cgl;
const LIGHT_INDEX_REGEX = new RegExp("{{LIGHT_INDEX}}", "g");
const LIGHT_TYPES = { "point": 0, "directional": 1, "spot": 2 };

function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}


const inTrigger = op.inTrigger("Trigger In");
const inCastShadow = op.inBool("Cast Shadow", true);
const inReceiveShadow = op.inBool("Receive Shadow", true);
const algorithms = ["Default", "PCF", "Poisson", "VSM"];
const inAlgorithm = op.inSwitch("Algorithm", algorithms, "Default");
const inSamples = op.inSwitch("Samples", [1, 2, 4, 8], 4);
const inSpread = op.inInt("Sample Distribution", 250);

const inShadowColorR = op.inFloatSlider("R", 0);
const inShadowColorG = op.inFloatSlider("G", 0);
const inShadowColorB = op.inFloatSlider("B", 0);
inShadowColorR.setUiAttribs({ "colorPick": true });
const inDiscardTransparent = op.inBool("Discard Transparent", false);
const inOpacityThreshold = op.inFloatSlider("Opacity Threshold", 0.5);
const ALPHA_MASK_SOURCE = ["Luminance", "R", "G", "B", "A"];
const inAlphaMaskSource = op.inSwitch("Alpha Mask Source", ALPHA_MASK_SOURCE, "Luminance");
const inOpacityTexture = op.inTexture("Opacity Texture");

inOpacityThreshold.setUiAttribs({ "greyout": !inDiscardTransparent.get() });
inAlphaMaskSource.setUiAttribs({ "greyout": !inDiscardTransparent.get() });
inSamples.setUiAttribs({ "greyout": true });
inSpread.setUiAttribs({ "greyout": true });
op.setPortGroup("", [inCastShadow, inReceiveShadow]);
op.setPortGroup("Shadow Settings", [inAlgorithm, inSamples, inSpread, inShadowColorR, inShadowColorG, inShadowColorB]);
op.setPortGroup("", [inDiscardTransparent]);
op.setPortGroup("Opacity Settings", [inOpacityThreshold, inAlphaMaskSource, inOpacityTexture]);

if (inReceiveShadow.get())
{
    if (inAlgorithm.get() === "PCF" || inAlgorithm.get() === "Poisson")
    {
        inSamples.setUiAttribs({ "greyout": false });
        inSpread.setUiAttribs({ "greyout": false });
    }
    else if (inAlgorithm.get() === "VSM" || inAlgorithm.get() === "Default")
    {
        inSamples.setUiAttribs({ "greyout": true });
        inSpread.setUiAttribs({ "greyout": true });
    }
}

inDiscardTransparent.onChange = () =>
{
    inOpacityThreshold.setUiAttribs({ "greyout": !inDiscardTransparent.get() });
    inAlphaMaskSource.setUiAttribs({ "greyout": !inDiscardTransparent.get() });
};

inAlphaMaskSource.onChange = () =>
{
    shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_LUMINANCE", inAlphaMaskSource.get() === "Luminance");
    shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_R", inAlphaMaskSource.get() === "R");
    shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_G", inAlphaMaskSource.get() === "G");
    shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_B", inAlphaMaskSource.get() === "B");
    shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_A", inAlphaMaskSource.get() === "A");
};

inReceiveShadow.onChange = () =>
{
    inAlgorithm.setUiAttribs({ "greyout": !inReceiveShadow.get() });
    setAlgorithmGreyouts();
};

inAlgorithm.onChange = () =>
{
    const current = inAlgorithm.get();
    algorithms.forEach((alg) => shaderModule.toggleDefine("MODE_" + alg.toUpperCase(), alg === current));

    setAlgorithmGreyouts();
};


function setAlgorithmGreyouts()
{
    if (!inReceiveShadow.get())
    {
        inSamples.setUiAttribs({ "greyout": true });
        inSpread.setUiAttribs({ "greyout": true });
        return;
    }

    if (inAlgorithm.get() === "PCF" || inAlgorithm.get() === "Poisson")
    {
        inSamples.setUiAttribs({ "greyout": false });
        inSpread.setUiAttribs({ "greyout": false });
    }
    else
    {
        inSamples.setUiAttribs({ "greyout": true });
        inSpread.setUiAttribs({ "greyout": true });
    }
}

inSamples.onChange = () =>
{
    shaderModule.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");
};


const outTrigger = op.outTrigger("Trigger Out");


const createVertexHead = (n, type) =>
{
    if (type === "ambient") return "";
    if (type === "point") return attachments.shadow_head_point_vert.replace(LIGHT_INDEX_REGEX, n);
    if (type === "spot") return attachments.shadow_head_spot_vert.replace(LIGHT_INDEX_REGEX, n);
    if (type === "directional") return attachments.shadow_head_directional_vert.replace(LIGHT_INDEX_REGEX, n);
};

const createVertexBody = (n, type) =>
{
    if (type === "ambient") return "";
    if (type === "point") return attachments.shadow_body_point_vert.replace(LIGHT_INDEX_REGEX, n);
    if (type === "spot") return attachments.shadow_body_spot_vert.replace(LIGHT_INDEX_REGEX, n);
    if (type === "directional") return attachments.shadow_body_directional_vert.replace(LIGHT_INDEX_REGEX, n);
};

const createFragmentHead = (n, type) =>
{
    if (type === "ambient") return "";
    if (type === "point") return attachments.shadow_head_point_frag.replace(LIGHT_INDEX_REGEX, n);
    if (type === "spot") return attachments.shadow_head_spot_frag.replace(LIGHT_INDEX_REGEX, n);
    if (type === "directional") return attachments.shadow_head_directional_frag.replace(LIGHT_INDEX_REGEX, n);
};

const createFragmentBody = (n, type) =>
{
    if (type === "ambient") return "";
    let fragmentCode = "";
    if (type === "spot")
    {
        fragmentCode = fragmentCode.concat(attachments.shadow_body_spot_frag.replace(LIGHT_INDEX_REGEX, n));
    }
    else if (type === "directional")
    {
        fragmentCode = fragmentCode.concat(attachments.shadow_body_directional_frag.replace(LIGHT_INDEX_REGEX, n));
    }
    else if (type === "point")
    {
        fragmentCode = fragmentCode.concat(attachments.shadow_body_point_frag.replace(LIGHT_INDEX_REGEX, n));
    }

    return fragmentCode;
};

const STATE = {
    "lastLength": 0,
    "updating": false
};

function renderShadowPassWithModule()
{
    shadowShaderModule.bind();

    if (inDiscardTransparent.get())
    {
        if (inOpacityTexture.get())
        {
            if (!shadowShaderModule.hasUniform("MOD_texOpacity"))
            {
                shadowShaderModule.addUniformFrag("t", "MOD_texOpacity", 0);
            }

            if (!shadowShaderModule.hasDefine("MOD_HAS_TEXTURE_OPACITY")) shadowShaderModule.define("MOD_HAS_TEXTURE_OPACITY", "");
            shadowShaderModule.pushTexture("MOD_texOpacity", inOpacityTexture.get().tex);
        }
        else
        {
            if (shadowShaderModule.hasUniform("MOD_texOpacity"))
                shadowShaderModule.removeUniform("MOD_texOpacity");

            if (shadowShaderModule.hasDefine("MOD_HAS_TEXTURE_OPACITY")) shadowShaderModule.removeDefine("MOD_HAS_TEXTURE_OPACITY");
        }
    }

    outTrigger.trigger();
    shadowShaderModule.unbind();
}

function createModuleShaders(lightStack)
{
    STATE.updating = true;
    removeUniforms();

    let vertexHead = "";
    let fragmentHead = "";
    let vertexBody = "";
    let fragmentBody = "";

    for (let i = 0; i < lightStack.length; i += 1)
    {
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

    shaderModule.removeModule(op.objName);

    shaderModule.addModule({
        "name": "MODULE_VERTEX_POSITION",
        "title": op.objName,
        // "priority": -2,
        "srcHeadVert": srcHeadVert,
        "srcBodyVert": srcBodyVert
    });

    shaderModule.addModule({
        "name": "MODULE_COLOR",
        // "priority": -2,
        "title": op.objName,
        "srcHeadFrag": srcHeadFrag,
        "srcBodyFrag": srcBodyFrag,
    });

    createUniforms(lightStack.length);
}

// * SHADOW PASS MODULE *
const shadowShaderModule = new CGL.ShaderModifier(cgl, "shadowPassModifier");
shadowShaderModule.addModule({
    "name": "MODULE_COLOR",
    // "priority": -2,
    "title": op.objName + "shadowPass",
    "srcHeadFrag": "",
    "srcBodyFrag": `
    #ifdef MOD_HAS_TEXTURE_OPACITY
        #ifdef MOD_ALPHA_MASK_LUMINANCE
            outColor.a *= dot(vec3(0.2126,0.7152,0.0722), texture(MOD_texOpacity, texCoord).rgb);
        #endif
        #ifdef MOD_ALPHA_MASK_R
            outColor.a *= texture(MOD_texOpacity, texCoord).r;
        #endif
        #ifdef MOD_ALPHA_MASK_G
            outColor.a *= texture(MOD_texOpacity, texCoord).g;
        #endif
        #ifdef MOD_ALPHA_MASK_B
            outColor.a *= texture(MOD_texOpacity, texCoord).b;
        #endif
        #ifdef MOD_ALPHA_MASK_A
            outColor.a *= texture(MOD_texOpacity, texCoord).a;
        #endif
        if (outColor.a < MOD_inOpacityThreshold) discard;
    #endif
    `
});

shadowShaderModule.addUniformFrag("f", "MOD_inOpacityThreshold", inOpacityThreshold);

shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_LUMINANCE", inAlphaMaskSource.get() === "Luminance");
shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_R", inAlphaMaskSource.get() === "R");
shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_G", inAlphaMaskSource.get() === "G");
shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_B", inAlphaMaskSource.get() === "B");
shadowShaderModule.toggleDefine("MOD_ALPHA_MASK_A", inAlphaMaskSource.get() === "A");

const srcHeadVertBase = attachments.head_vert;
const srcBodyVertBase = "";
const srcHeadFragBase = attachments.head_frag;
const srcBodyFragBase = "";

let srcHeadVert = srcHeadVertBase;
let srcBodyVert = srcBodyVertBase;
let srcHeadFrag = srcHeadFragBase;
let srcBodyFrag = srcBodyFragBase;


// * MAIN PASS MODULE *
const shaderModule = new CGL.ShaderModifier(cgl, "shadowModule");
shaderModule.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");
shaderModule.toggleDefine("RECEIVE_SHADOW", inReceiveShadow);

algorithms.forEach((alg) => shaderModule.toggleDefine("MODE_" + alg.toUpperCase(), alg === inAlgorithm.get()));


const hasShadowMap = [];
const hasShadowCubemap = [];

function removeUniforms()
{
    for (let i = 0; i < STATE.lastLength; i += 1)
    {
        shaderModule.removeUniformStruct("MOD_light" + i);
        shaderModule.removeUniform("MOD_shadowMap" + i);
        shaderModule.removeUniform("MOD_shadowMapCube" + i);
        shaderModule.removeUniform("MOD_normalOffset" + i);
        shaderModule.removeUniform("MOD_lightMatrix" + i);
        shaderModule.removeDefine("HAS_SHADOW_MAP_" + i);
    }

    if (STATE.lastLength > 0)
    {
        shaderModule.removeUniform("MOD_sampleSpread");
        shaderModule.removeUniform("MOD_camPos");
    }
    hasShadowMap.length = 0;
    hasShadowCubemap.length = 0;
}

function createUniforms(lightsCount)
{
    for (let i = 0; i < lightsCount; i += 1)
    {
        const light = cgl.frameStore.lightStack[i];

        shaderModule.addUniformStructFrag("MOD_Light", "MOD_light" + i, [
            { "type": "3f", "name": "position", "v1": null },
            { "type": "2i", "name": "typeCastShadow", "v1": null },
            { "type": "4f", "name": "shadowProperties", "v1": null },
            { "type": "f", "name": "shadowStrength", "v1": light.shadowStrength },
        ]);

        hasShadowMap[i] = false;
        hasShadowCubemap[i] = false;

        if (light.type !== "point")
        {
            shaderModule.addUniformVert("m4", "MOD_lightMatrix" + i, mat4.create(), null, null, null);
            shaderModule.addUniformVert("f", "MOD_normalOffset" + i, 0, null, null, null, null);
            shaderModule.addUniformFrag("t", "MOD_shadowMap" + i, 0, null, null, null);
        }
        else shaderModule.addUniformFrag("tc", "MOD_shadowMapCube" + i, 0, null, null, null);
    }

    if (lightsCount > 0)
    {
        shaderModule.addUniformFrag("3f", "MOD_shadowColor", inShadowColorR, inShadowColorG, inShadowColorB, null);
        shaderModule.addUniformFrag("f", "MOD_sampleSpread", inSpread, null, null, null);
        if (cgl.frameStore.lightStack.map((l) => l.type).indexOf("point") !== -1) shaderModule.addUniformFrag("3f", "MOD_camPos", [0, 0, 0], null, null, null);
    }

    STATE.lastLength = lightsCount;
    STATE.updating = false;
}

function setUniforms(lightStack)
{
    if (STATE.updating) return;
    const receiveShadow = inReceiveShadow.get();
    const castShadow = false;

    for (let i = 0; i < lightStack.length; i += 1)
    {
        const light = lightStack[i];

        if (light.type === "ambient") continue;

        shaderModule.setUniformValue("MOD_light" + i + ".position", light.position);
        shaderModule.setUniformValue("MOD_light" + i + ".typeCastShadow", [
            LIGHT_TYPES[light.type],
            Number(light.castShadow),
        ]);

        shaderModule.setUniformValue("MOD_light" + i + ".shadowStrength", light.shadowStrength);

        if (light.shadowMap)
        {
            if (!hasShadowMap[i])
            {
                hasShadowMap[i] = true;
                hasShadowCubemap[i] = false;
            }
            if (!shaderModule.hasDefine("HAS_SHADOW_MAP_" + i))
            {
                shaderModule.define("HAS_SHADOW_MAP_" + i, true);
            }

            if (light.type !== "point")
            {
                shaderModule.setUniformValue("MOD_lightMatrix" + i, light.lightMatrix);
                shaderModule.setUniformValue("MOD_normalOffset" + i, light.normalOffset);
            }

            shaderModule.setUniformValue("MOD_light" + i + ".shadowProperties", [
                light.nearFar[0],
                light.nearFar[1],
                light.shadowMap.width,
                light.shadowBias
            ]);
            if (light.type === "point") shaderModule.setUniformValue("MOD_camPos", [_tempCamPosMatrix[12], _tempCamPosMatrix[13], _tempCamPosMatrix[14]]);


            if (hasShadowMap[i])
            {
                if (light.shadowMap.tex) shaderModule.pushTexture("MOD_shadowMap" + i, light.shadowMap.tex);
            }
            continue;
        }

        if (light.shadowCubeMap)
        {
            if (!hasShadowCubemap[i])
            {
                hasShadowCubemap[i] = true;
                hasShadowMap[i] = false;
            }

            if (!shaderModule.hasDefine("HAS_SHADOW_MAP_" + i)) shaderModule.define("HAS_SHADOW_MAP_" + i, "");

            shaderModule.setUniformValue("MOD_light" + i + ".shadowProperties", [
                light.nearFar[0],
                light.nearFar[1],
                light.shadowCubeMap.size,
                light.shadowBias
            ]);

            if (hasShadowCubemap[i])
            {
                if (light.shadowCubeMap.cubemap) shaderModule.pushTexture("MOD_shadowMapCube" + i, light.shadowCubeMap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
            }
            continue;
        }

        else
        {
            if (hasShadowMap[i])
            {
                if (shaderModule.hasDefine("HAS_SHADOW_MAP_" + i))
                {
                    shaderModule.removeDefine("HAS_SHADOW_MAP_" + i);
                }
                hasShadowMap[i] = false;
            }
            else if (hasShadowCubemap[i])
            {
                if (shaderModule.hasDefine("HAS_SHADOW_MAP_" + i)) shaderModule.removeDefine("HAS_SHADOW_MAP_" + i);
                hasShadowCubemap[i] = false;
            }
            continue;
        }
    }
}


function updateShader()
{
    if (cgl.frameStore.lightStack.length !== STATE.lastLength)
        createModuleShaders(cgl.frameStore.lightStack);

    setUniforms(cgl.frameStore.lightStack);
}

inTrigger.onLinkChanged = function ()
{
    if (!inTrigger.isLinked()) STATE.lastLength = 0;
    hasShadowMap.length = 0;
    hasShadowCubemap.length = 0;
};
outTrigger.onLinkChanged = function ()
{
    if (!outTrigger.isLinked()) STATE.lastLength = 0;
    hasShadowMap.length = 0;
    hasShadowCubemap.length = 0;
};

const _tempCamPosMatrix = mat4.create();


inTrigger.onTriggered = () =>
{
    if (STATE.updating)
    {
        outTrigger.trigger();
        return;
    }

    if (cgl.frameStore.shadowPass)
    {
        if (!inCastShadow.get()) return;
        renderShadowPassWithModule();
        return;
    }

    if (!inReceiveShadow.get())
    {
        outTrigger.trigger();
        return;
    }

    mat4.invert(_tempCamPosMatrix, cgl.vMatrix);

    if (cgl.frameStore.lightStack)
    {
        if (cgl.frameStore.lightStack.length === 0)
        {
            op.setUiError("nolights", "There are no lights that cast shadows. Please add lights to your patch to make this warning disappear.", 0);
        }
        else
        {
            let oneLightCastsShadow = false;

            for (let i = 0; i < cgl.frameStore.lightStack.length; i += 1) oneLightCastsShadow = oneLightCastsShadow || cgl.frameStore.lightStack[i].castShadow;

            if (oneLightCastsShadow) op.setUiError("nolights", null);
            else op.setUiError("nolights", "There are no lights that cast shadows. Please add lights to your patch to make this warning disappear.", 0);
        }
        if (cgl.frameStore.lightStack.length)
        {
            updateShader();

            shaderModule.bind();
            outTrigger.trigger();
            shaderModule.unbind();
        }
    }
    else outTrigger.trigger();
};
