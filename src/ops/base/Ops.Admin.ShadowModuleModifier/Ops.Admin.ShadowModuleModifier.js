const cgl = op.patch.cgl;
const LIGHT_INDEX_REGEX = new RegExp("{{LIGHT_INDEX}}", "g");
const LIGHT_TYPES = { "point": 0, "directional": 1, "spot": 2 };

function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}


const inTrigger = op.inTrigger("Trigger In");
const inCastShadow = op.inBool("Cast Shadow", true);
const inReceiveShadow = op.inBool("Receive Shadow", false);
const algorithms = ["Default", "PCF", "Poisson", "VSM"];
const inAlgorithm = op.inSwitch("Algorithm", algorithms, "Default");
const inSamples = op.inSwitch("Samples", [1, 2, 4, 8], 4);
const inSpread = op.inInt("Sample Spread", 250);

inSamples.setUiAttribs({ "greyout": true });
inSpread.setUiAttribs({ "greyout": true });

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

op.setPortGroup("", [inCastShadow, inReceiveShadow]);
op.setPortGroup("Shadow Settings", [inAlgorithm, inSamples, inSpread]);

inReceiveShadow.onChange = () =>
{
    inAlgorithm.setUiAttribs({ "greyout": !inReceiveShadow.get() });
    setAlgorithmGreyouts();
    // if (shader) shader.toggleDefine("RECEIVE_SHADOW", inReceiveShadow.get());
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

function createModuleShaders(lightStack)
{
    STATE.updating = true;
    removeUniforms();
    console.log("im here yo");
    // if (lightStack.length === lastLength) return;
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

    // STATE.lastLength = lightStack.length;

    op.log("createModuleShaders: before remove", shaderModule);
    shaderModule.removeModule(op.objName);
    op.log("createModuleShaders: after remove", shaderModule);

    shaderModule.addModule({
        "name": "MODULE_VERTEX_POSITION",
        "title": op.objName,
        "priority": -2,
        "srcHeadVert": srcHeadVert,
        "srcBodyVert": srcBodyVert
    });
    // shaderModule.removeModule(op.objName);
    shaderModule.addModule({
        "name": "MODULE_COLOR",
        "priority": -2,
        "title": op.objName,
        "srcHeadFrag": srcHeadFrag,
        "srcBodyFrag": srcBodyFrag,
    });

    if (lightStack.length === 0) shaderModule.removeDefine("HAS_SHADOW_MAP");
    if (lightStack.length > 0 && !shaderModule.hasDefine("HAS_SHADOW_MAP"))
    {
        op.log("ay", shaderModule.hasDefine("HAS_SHADOW_MAP"));
        shaderModule.define("HAS_SHADOW_MAP", true);
        op.log("ay after", shaderModule.hasDefine("HAS_SHADOW_MAP"));
    }
    createUniforms(lightStack.length);
    op.log("after createUniform", shaderModule, lightStack.length);
}


const shader = null;
const vertexModule = null;
const fragmentModule = null;

const srcHeadVertBase = attachments.head_vert;
const srcBodyVertBase = "";
const srcHeadFragBase = attachments.head_frag;
const srcBodyFragBase = "";

let srcHeadVert = srcHeadVertBase;
let srcBodyVert = srcBodyVertBase;
let srcHeadFrag = srcHeadFragBase;
let srcBodyFrag = srcBodyFragBase;


const shaderModule = new CGL.ShaderModifier(cgl, "shadowModule");
CGL.shaderModule = shaderModule;
op.log("shadermod after create", shaderModule);
shaderModule.define("SAMPLE_AMOUNT", "float(" + clamp(Number(inSamples.get()), 1, 16).toString() + ")");
shaderModule.toggleDefine("RECEIVE_SHADOW", inReceiveShadow);

algorithms.forEach((alg) => shaderModule.toggleDefine("MODE_" + alg.toUpperCase(), alg === inAlgorithm.get()));


const hasShadowMap = [];

function removeUniforms()
{
    for (let i = 0; i < STATE.lastLength; i += 1)
    {
        shaderModule.removeUniform("MOD_light" + i + ".position");
        shaderModule.removeUniform("MOD_light" + i + ".typeCastShadow");
        shaderModule.removeUniform("MOD_light" + i + ".shadowProperties");
        shaderModule.removeUniform("MOD_light" + i + ".shadowStrength");
        shaderModule.removeUniform("MOD_shadowMap" + i);
        shaderModule.removeUniform("MOD_normalOffset" + i);
        shaderModule.removeUniform("MOD_lightMatrix" + i);
    }

    if (STATE.lastLength > 0)
    {
        shaderModule.removeUniform("MOD_sampleSpread");
        shaderModule.removeUniform("MOD_camPos");
    }
}

function createUniforms(lightsCount)
{
    for (let i = 0; i < lightsCount; i += 1)
    {
        const light = cgl.frameStore.lightStack[i];

        shaderModule.addUniformsStruct("MOD_light" + i, "MOD_Light", [
            { "type": "3f", "name": "position", "v1": null },
            { "type": "2i", "name": "typeCastShadow", "v1": null },
            { "type": "4f", "name": "shadowProperties", "v1": null },
            { "type": "f", "name": "shadowStrength", "v1": null },
        ], "frag");

        hasShadowMap[i] = false;
        shaderModule.addUniform("m4", "MOD_lightMatrix" + i, mat4.create(), null, null, null, null, null, null, "both");
        shaderModule.addUniform("f", "MOD_normalOffset" + i, 0, null, null, null, null, null, null, "both");
    }

    if (lightsCount > 0)
    {
        shaderModule.addUniform("f", "MOD_sampleSpread", inSpread);
        shaderModule.addUniform("3f", "MOD_camPos", [0, 0, 0], null, null, null, null, null, null, "frag");
    }

    STATE.lastLength = lightsCount;
    STATE.updating = false;
}

function setUniforms(lightStack)
{
    const receiveShadow = inReceiveShadow.get();
    let castShadow = false;

    for (let i = 0; i < lightStack.length; i += 1)
    {
        const light = lightStack[i];
        if (light.type === "ambient") continue;
        shaderModule.setUniformValue("MOD_light" + i + ".position", light.position);
        shaderModule.setUniformValue("MOD_light" + i + ".typeCastShadow", [
            LIGHT_TYPES[light.type],
            light.castShadow,
        ]);

        if (light.shadowMap)
        {
            shaderModule.setUniformValue("MOD_lightMatrix" + i, light.lightMatrix);
            shaderModule.setUniformValue("MOD_normalOffset" + i, light.normalOffset);
            shaderModule.setUniformValue("MOD_light" + i + ".shadowProperties", [
                light.nearFar[0],
                light.nearFar[1],
                light.shadowMap.width,
                light.shadowBias
            ]);
            shaderModule.setUniformValue("MOD_light" + i + ".shadowStrength", light.shadowStrength);

            if (!hasShadowMap[i])
            {
                shaderModule.addUniform(light.type !== "point" ? "t" : "tc", "MOD_shadowMap" + i, 0, null, null, null, null, null, null, "frag");
                hasShadowMap[i] = true;
            }
            shaderModule.pushTexture("MOD_shadowMap" + i, light.shadowMap.tex);
        }
        else if (light.shadowCubeMap)
        {
            if (!hasShadowMap[i])
            {
                shaderModule.addUniform(light.type !== "point" ? "t" : "tc", "MOD_shadowMap" + i, 0, null, null, null, null, null, null, "frag");
                hasShadowMap[i] = true;
            }

            shaderModule.pushTexture("MOD_shadowMap" + i, light.shadowCubeMap.cubemap, cgl.gl.TEXTURE_CUBE_MAP);
            // console.log("CBEMA", shaderModule._shaders);
        }
        else
        {
            if (hasShadowMap[i]) hasShadowMap[i] = false;
        }
        castShadow = castShadow || light.castShadow;
        if (receiveShadow && castShadow)
        {
            // if (!shaderModule.hasDefine("HAS_SHADOW_MAP")) shaderModule.define("HAS_SHADOW_MAP");
        }
        else
        {
            // if (shaderModule.hasDefine("HAS_SHADOW_MAP")) shaderModule.removeDefine("HAS_SHADOW_MAP");
        }
    }
}


function updateShader()
{
    if (cgl.frameStore.lightStack.length !== STATE.lastLength)
    {
        createModuleShaders(cgl.frameStore.lightStack);
    }

    setUniforms(cgl.frameStore.lightStack);
}

inTrigger.onLinkChanged = function ()
{
    if (!inTrigger.isLinked()) STATE.lastLength = 0;
};

const _tempCamPosMatrix = mat4.create();

inTrigger.onTriggered = () =>
{
    if (STATE.updating) return;
    if (!inCastShadow.get())
    {
        if (!cgl.frameStore.shadowPass)
        {
            outTrigger.trigger();
        }
        return;
    }

    if (!inReceiveShadow.get())
    {
        outTrigger.trigger();
        return;
    }

    if (cgl.frameStore.shadowPass)
    {
        outTrigger.trigger();
        return;
    }

    if (!cgl.frameStore.lightStack)
    {
        outTrigger.trigger();
        return;
    }

    mat4.invert(_tempCamPosMatrix, cgl.vMatrix);

    updateShader();

    shaderModule.setUniformValue("MOD_camPos", [_tempCamPosMatrix[12], _tempCamPosMatrix[13], _tempCamPosMatrix[14]]);

    shaderModule.bind();

    outTrigger.trigger();
    shaderModule.unbind();
};
