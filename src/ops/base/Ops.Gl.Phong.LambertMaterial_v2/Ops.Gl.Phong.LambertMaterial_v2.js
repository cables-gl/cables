const LIGHT_TYPES = { "ambient": 0, "point": 1, "directional": 2, "spot": 3 };
const
    execute = op.inTrigger("Execute"),
    r = op.inValueSlider("Diffuse R", Math.random()),
    g = op.inValueSlider("Diffuse G", Math.random()),
    b = op.inValueSlider("Diffuse B", Math.random()),
    a = op.inValueSlider("Diffuse A", 1.0);

r.setUiAttribs({ "colorPick": true });
op.setPortGroup("Diffuse Color", [r, g, b, a]);
const inToggleDoubleSided = op.inBool("Double Sided", false);
inToggleDoubleSided.setUiAttribs({ "hidePort": true });
inToggleDoubleSided.onChange = function ()
{
    shader.toggleDefine("DOUBLE_SIDED", inToggleDoubleSided.get());
};
op.setPortGroup("Material Properties", [inToggleDoubleSided]);

op.toWorkPortsNeedToBeLinked(execute);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);

const inDiffuseTexture = op.inTexture("Diffuse Texture");
let diffuseTextureUniform = null;
const textureTransformsUniform = null;
inDiffuseTexture.onChange = updateDiffuseTexture;

// TEXTURE TRANSFORMS
const inColorizeTexture = op.inBool("Colorize Texture", false);
inColorizeTexture.onChange = function ()
{
    shader.toggleDefine("COLORIZE_TEXTURE", inColorizeTexture.get());
};

op.setPortGroup("Texture", [
    inDiffuseTexture,
    inColorizeTexture
]);

let oldCount = 0;

const next = op.outTrigger("next");
const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "LambertMaterial");
shader.define("NUM_LIGHTS", "1");

const colUni = new CGL.Uniform(shader, "4f", "materialColor", r, g, b, a);

shader.uniformColorDiffuse = colUni;

const outShader = op.outObject("Shader");
outShader.setRef(shader);

const MAX_UNIFORM_FRAGMENTS = cgl.maxUniformsFrag;
const MAX_LIGHTS = MAX_UNIFORM_FRAGMENTS === 64 ? 6 : 16;
const iViewMatrix = mat4.create();

shader.setSource(attachments.lambert_vert, attachments.lambert_frag);

shader.define("MAX_LIGHTS", MAX_LIGHTS.toString());

let defaultUniform = null;
const lightUniforms = [];
const hasLight = {
    "directional": false,
    "spot": false,
    "ambient": false,
    "point": false,
};

const DEFAULT_LIGHTSTACK = [
    {
        "type": "point",
        "position": [0, 2, 1],
        "intensity": 1,
        "attenuation": 0,
        "falloff": 0.5,
        "radius": 80,
        "castLight": 1,
    }];

updateDiffuseTexture();

function updateDiffuseTexture()
{
    if (inDiffuseTexture.get())
    {
        if (!shader.hasDefine("HAS_TEXTURE_DIFFUSE"))
        {
            shader.define("HAS_TEXTURE_DIFFUSE");
            if (!diffuseTextureUniform) diffuseTextureUniform = new CGL.Uniform(shader, "t", "texDiffuse", 0);
        }
    }
    else
    {
        shader.removeUniform("texDiffuse");
        shader.removeDefine("HAS_TEXTURE_DIFFUSE");
        diffuseTextureUniform = null;
    }
}

function createDefaultUniform()
{
    defaultUniform = {
        "color": new CGL.Uniform(shader, "3f", "lights[0].color", [1, 1, 1]),
        "position": new CGL.Uniform(shader, "3f", "lights[0].position", [0, 11, 0]),

        // intensity, attenuation, falloff, radius
        "lightProperties": new CGL.Uniform(shader, "4f", "lights[0].lightProperties", [1, 1, 1, 1]),

        "conePointAt": new CGL.Uniform(shader, "3f", "lights[0].conePointAt", vec3.create()),
        "spotProperties": new CGL.Uniform(shader, "3f", "lights[0].spotProperties", [0, 0, 0, 0]),

        "castLightType": new CGL.Uniform(shader, "2i", "lights[0].castLightType", [0, 0])
    };
}

function setDefaultUniform(light)
{
    shader.define("NUM_LIGHTS", "1");
    shader.removeDefine("HAS_SPOT");

    defaultUniform.position.setValue(light.position);
    defaultUniform.color.setValue(light.color);

    defaultUniform.lightProperties.setValue([
        light.intensity,
        light.attenuation,
        light.falloff,
        light.radius,
    ]);

    defaultUniform.castLightType.setValue([
        1,
        LIGHT_TYPES[light.type]
    ]);
    defaultUniform.conePointAt.setValue(light.conePointAt);
    defaultUniform.spotProperties.setValue([
        light.cosConeAngle,
        light.cosConeAngleInner,
        light.spotExponent,
    ]);
}

function createUniforms(lightStack)
{
    for (let i = 0; i < lightUniforms.length; i += 1) lightUniforms[i] = null;

    hasLight.directional = false;
    hasLight.spot = false;
    hasLight.ambient = false;
    hasLight.point = false;

    for (let i = 0; i < lightStack.length; i += 1)
    {
        if (i === MAX_LIGHTS) return;
        lightUniforms[i] = null;

        const light = lightStack[i];
        const type = light.type;

        if (!hasLight[type]) hasLight[type] = true;

        if (!lightUniforms[i])
        {
            lightUniforms[i] = {
                "color": new CGL.Uniform(shader, "3f", "lights[" + i + "].color", [1, 1, 1]),
                "position": new CGL.Uniform(shader, "3f", "lights[" + i + "].position", [0, 11, 0]),
                // intensity, attenuation, falloff, radius
                "lightProperties": new CGL.Uniform(shader, "4f", "lights[" + i + "].lightProperties", [1, 1, 1, 1]),
                "conePointAt": new CGL.Uniform(shader, "3f", "lights[" + i + "].conePointAt", vec3.create()),
                "spotProperties": new CGL.Uniform(shader, "3f", "lights[" + i + "].spotProperties", [0, 0, 0, 0]),
                "castLightType": new CGL.Uniform(shader, "2i", "lights[" + i + "].castLightType", [0, 0])
            };
        }
    }

    for (let i = 0, keys = Object.keys(hasLight); i < keys.length; i += 1)
    {
        const key = keys[i];

        shader.toggleDefine("HAS_" + key.toUpperCase(), hasLight[key]);
    }
}

function setUniforms(lightStack)
{
    for (let i = 0; i < lightStack.length; i += 1)
    {
        const light = lightStack[i];
        light.isUsed = true; // this property is used to set UI warnings in the lights

        lightUniforms[i].position.setValue(light.position);
        lightUniforms[i].color.setValue(light.color);

        lightUniforms[i].lightProperties.setValue([
            light.intensity,
            light.attenuation,
            light.falloff,
            light.radius,
        ]);

        lightUniforms[i].conePointAt.setValue(light.conePointAt);
        lightUniforms[i].spotProperties.setValue([
            light.cosConeAngle,
            light.cosConeAngleInner,
            light.spotExponent,
        ]);

        lightUniforms[i].castLightType.setValue([
            Number(light.castLight),
            LIGHT_TYPES[light.type]
        ]);
    }
}

function compareLights(lightStack)
{
    if (lightStack.length !== oldCount)
    {
        createUniforms(lightStack);
        oldCount = lightStack.length;
        shader.define("NUM_LIGHTS", "" + Math.max(oldCount, 1));
        setUniforms(lightStack);
    }
    else
    {
        setUniforms(lightStack);
    }
}

function updateLights()
{
    if ((!cgl.tempData.lightStack || !cgl.tempData.lightStack.length))
    {
        // if no light in light stack, use default light & set count to -1
        // so when a new light gets added, the shader does recompile
        if (!defaultUniform) createDefaultUniform();

        mat4.invert(iViewMatrix, cgl.vMatrix);
        // set default light position to camera position
        DEFAULT_LIGHTSTACK[0].position = [iViewMatrix[12], iViewMatrix[13], iViewMatrix[14]];

        setDefaultUniform(DEFAULT_LIGHTSTACK[0]);
        oldCount = -1;
    }
    else
    {
        if (shader)
        {
            if (cgl.tempData.lightStack)
            {
                if (cgl.tempData.lightStack.length)
                {
                    defaultUniform = null;
                    compareLights(cgl.tempData.lightStack);
                }
            }
        }
    }
}

execute.onTriggered = function ()
{
    if (!shader)
    {
        op.log("lambert has no shader...");
        return;
    }
    if (cgl.tempData.lightStack)
    {
        if (cgl.tempData.lightStack.length === 0) op.setUiError("deflight", "Default light is enabled. Please add lights to your patch to make this warning disappear.", 1);
        else op.setUiError("deflight", null);
    }
    cgl.pushShader(shader);
    shader.popTextures();
    updateLights();
    if (inDiffuseTexture.get()) shader.pushTexture(diffuseTextureUniform, inDiffuseTexture.get().tex);

    next.trigger();
    cgl.popShader();
};
