function Light(config) {
     this.type = config.type || "point";
     this.color = config.color || [1, 1, 1];
     this.specular = config.specular || [0, 0, 0];
     this.position = config.position || null;
     this.intensity = config.intensity || 1;
     this.radius = config.radius || 1;
     this.falloff = config.falloff || 1;
     this.spotExponent = config.spotExponent || 1;
     this.cosConeAngleInner = Math.cos(CGL.DEG2RAD*config.coneAngleInner) || 0; // spot light
     this.cosConeAngle = config.cosConeAngle || 0;
     this.conePointAt = config.conePointAt || [0, 0, 0];
     return this;
}


const cgl = op.patch.cgl;

const inTrigger = op.inTrigger("Trigger In");


// * DIFFUSE *
const inDiffuseR = op.inFloat("R", Math.random());
const inDiffuseG = op.inFloat("G", Math.random());
const inDiffuseB = op.inFloat("B", Math.random());
const inDiffuseA = op.inFloatSlider("A", 1);
const diffuseColors = [inDiffuseR, inDiffuseG, inDiffuseB, inDiffuseA];
op.setPortGroup("Diffuse Color", diffuseColors);

const inToggleOrenNayar = op.inBool("Enable", false);
const inAlbedo = op.inFloatSlider("Albedo", 0.707);
const inRoughness = op.inFloatSlider("Roughness", 0.835);

inToggleOrenNayar.setUiAttribs({ hidePort: true });
inAlbedo.setUiAttribs({ greyout: true });
inRoughness.setUiAttribs({ greyout: true });
inDiffuseR.setUiAttribs({ colorPick: true });
op.setPortGroup("Oren-Nayar Diffuse",[inToggleOrenNayar, inAlbedo, inRoughness]);


inToggleOrenNayar.onChange = function() {
    if (inToggleOrenNayar.get()) {
        shader.define("ENABLE_OREN_NAYAR_DIFFUSE");
        inAlbedo.setUiAttribs({ greyout: false });
        inRoughness.setUiAttribs({ greyout: false });
    } else {
        shader.removeDefine("ENABLE_OREN_NAYAR_DIFFUSE");
        inAlbedo.setUiAttribs({ greyout: true });
        inRoughness.setUiAttribs({ greyout: true });
    }
}

// * FRESNEL *
const inToggleFresnel=op.inValueBool("Active", false);
inToggleFresnel.setUiAttribs({ hidePort: true });
const inFresnel=op.inValueSlider("Fresnel Intensity", 0.7);
const inFresnelWidth = op.inFloat("Fresnel Width", 1);
const inFresnelExponent = op.inFloat("Fresnel Exponent", 6);
const inFresnelR = op.inFloat("Fresnel R", 1);
const inFresnelG = op.inFloat("Fresnel G", 1);
const inFresnelB = op.inFloat("Fresnel B", 1);
inFresnelR.setUiAttribs({ colorPick: true });

const fresnelArr = [inFresnel, inFresnelWidth, inFresnelExponent, inFresnelR, inFresnelG, inFresnelB];
fresnelArr.forEach(function(port) { port.setUiAttribs({ greyout: true })});
op.setPortGroup("Fresnel", fresnelArr.concat([inToggleFresnel]));

inToggleFresnel.onChange = function() {
    if (inToggleFresnel.get()) {
        shader.define("ENABLE_FRESNEL");
        fresnelArr.forEach(function(port) { port.setUiAttribs({ greyout: false }); })
    } else {
        shader.removeDefine("ENABLE_FRESNEL");
        fresnelArr.forEach(function(port) { port.setUiAttribs({ greyout: true }); })
    }
}

// * SPECULAR *
const inShininess = op.inFloat("Shininess", 4);
const inSpecularCoefficient = op.inFloatSlider("Specular Amount", 1);
const inSpecularMode = op.inSwitch("Specular Model", ["Blinn", "Schlick", "Phong", "Gauss"], "Blinn");

inSpecularMode.setUiAttribs({ hidePort: true });
const specularColors = [inShininess, inSpecularCoefficient, inSpecularMode];
op.setPortGroup("Specular", specularColors);



// * LIGHT *
const inEnergyConservation = op.inValueBool("Energy Conservation", false);
const inToggleDoubleSided = op.inBool("Double Sided Material", false);

inEnergyConservation.setUiAttribs({ hidePort: true });
inToggleDoubleSided.setUiAttribs({ hidePort: true });

const lightProps = [inEnergyConservation, inToggleDoubleSided];
op.setPortGroup("Light Options", lightProps);

// TEXTURES
const inDiffuseTexture = op.inTexture("Diffuse Texture");
const inSpecularTexture = op.inTexture("Specular Texture");
const inNormalTexture = op.inTexture("Normal Map");
const inAoTexture = op.inTexture("AO Texture");
const inEmissiveTexture = op.inTexture("Emissive Texture");
const inAlphaTexture = op.inTexture("Opacity Texture");
op.setPortGroup("Textures",[inDiffuseTexture, inSpecularTexture, inNormalTexture, inAoTexture, inEmissiveTexture, inAlphaTexture]);

// TEXTURE TRANSFORMS
const inColorizeTexture = op.inBool("Colorize Texture",false);
const inDiffuseRepeatX = op.inFloat("Diffuse Repeat X", 1);
const inDiffuseRepeatY = op.inFloat("Diffuse Repeat Y", 1);
const inTextureOffsetX = op.inFloat("Texture Offset X", 0);
const inTextureOffsetY = op.inFloat("Texture Offset Y", 0);
const inSpecularIntensity = op.inFloatSlider("Specular Intensity", 1);
const inNormalIntensity = op.inFloatSlider("Normal Map Intensity", 0.5);
const inAoIntensity = op.inFloatSlider("AO Intensity", 1);
const inEmissiveIntensity = op.inFloat("Emissive Intensity", 1);

inColorizeTexture.setUiAttribs({ hidePort: true });
op.setPortGroup("Texture Transforms",[inNormalIntensity, inAoIntensity, inSpecularIntensity, inEmissiveIntensity, inColorizeTexture, inDiffuseRepeatY, inDiffuseRepeatX, inTextureOffsetY, inTextureOffsetX]);

const alphaMaskSource=op.inSwitch("Alpha Mask Source",["Luminance","R","G","B","A"],"Luminance");
alphaMaskSource.setUiAttribs({ greyout:true });

const texCoordAlpha=op.inValueBool("Opacity TexCoords Transform",false);
const discardTransPxl=op.inValueBool("Discard Transparent Pixels");

texCoordAlpha.setUiAttribs({ hidePort: true });
discardTransPxl.setUiAttribs({ hidePort: true });

op.setPortGroup("Opacity Texture",[alphaMaskSource, texCoordAlpha, discardTransPxl]);

function bindTextures() {
    if(inDiffuseTexture.get()) cgl.setTexture(0, inDiffuseTexture.get().tex);
    if (inSpecularTexture.get()) cgl.setTexture(1, inSpecularTexture.get().tex);
    if(inNormalTexture.get()) cgl.setTexture(2, inNormalTexture.get().tex);
    if (inAoTexture.get()) cgl.setTexture(3, inAoTexture.get().tex);
    if (inEmissiveTexture.get()) cgl.setTexture(4, inEmissiveTexture.get().tex);
    if (inAlphaTexture.get()) cgl.setTexture(5, inAlphaTexture.get().tex);
}


const outTrigger = op.outTrigger("Trigger Out");
const shaderOut = op.outObject("Shader");
shaderOut.ignoreValueSerialize = true;


const shader = new CGL.Shader(cgl,"simosphong");
shader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
shader.setSource(attachments.simosphong_vert, attachments.simosphong_frag);

let diffuseTextureUniform = null;
let specularTextureUniform = null;
let normalTextureUniform = null;
let aoTextureUniform = null;
let emissiveTextureUniform = null;
let alphaTextureUniform = null;


inColorizeTexture.onChange = function() {
    shader.toggleDefine("COLORIZE_TEXTURE", inColorizeTexture.get());
}
function updateDiffuseTexture() {
    if (inDiffuseTexture.get()) {
            if(!shader.hasDefine('HAS_TEXTURE_DIFFUSE')) {
                shader.define('HAS_TEXTURE_DIFFUSE');
                if (!diffuseTextureUniform) diffuseTextureUniform = new CGL.Uniform(shader, 't', 'texDiffuse', 0);
            }
    } else {
                shader.removeUniform('texDiffuse');
                shader.removeDefine('HAS_TEXTURE_DIFFUSE');
                diffuseTextureUniform = null;
            }
}

function updateSpecularTexture() {
    if (inSpecularTexture.get()) {
        if(!shader.hasDefine('HAS_TEXTURE_SPECULAR')) {
            shader.define('HAS_TEXTURE_SPECULAR');
            if (!specularTextureUniform) specularTextureUniform = new CGL.Uniform(shader, 't', 'texSpecular', 1);
        }
    } else {
        shader.removeUniform('texSpecular');
        shader.removeDefine('HAS_TEXTURE_SPECULAR');
        specularTextureUniform = null;
        }
}

function updateNormalTexture() {
    if (inNormalTexture.get()) {
        if(!shader.hasDefine('HAS_TEXTURE_NORMAL')) {
            shader.define('HAS_TEXTURE_NORMAL');
            if (!normalTextureUniform) normalTextureUniform = new CGL.Uniform(shader, 't', 'texNormal', 2);
        }
    } else {
        shader.removeUniform('texNormal');
        shader.removeDefine('HAS_TEXTURE_NORMAL');
        normalTextureUniform = null;
        }
}

function updateAoTexture() {
    if (inAoTexture.get()) {
        if(!shader.hasDefine('HAS_TEXTURE_AO')) {
            shader.define('HAS_TEXTURE_AO');
            if (!aoTextureUniform) aoTextureUniform = new CGL.Uniform(shader, 't', 'texAO', 3);
        }
    } else {
        shader.removeUniform('texAO');
        shader.removeDefine('HAS_TEXTURE_AO');
        aoTextureUniform = null;
        }
}

function updateEmissiveTexture() {
    if (inEmissiveTexture.get()) {
        if(!shader.hasDefine('HAS_TEXTURE_EMISSIVE')) {
            shader.define('HAS_TEXTURE_EMISSIVE');
            if (!emissiveTextureUniform) emissiveTextureUniform = new CGL.Uniform(shader, 't', 'texEmissive', 4);
        }
    } else {
        shader.removeUniform('texEmissive');
        shader.removeDefine('HAS_TEXTURE_EMISSIVE');
        emissiveTextureUniform = null;
    }
}

// TEX OPACITY

function updateAlphaMaskMethod()
{
    if(alphaMaskSource.get()=='Alpha Channel') shader.define('ALPHA_MASK_ALPHA');
        else shader.removeDefine('ALPHA_MASK_ALPHA');

    if(alphaMaskSource.get()=='Luminance') shader.define('ALPHA_MASK_LUMI');
        else shader.removeDefine('ALPHA_MASK_LUMI');

    if(alphaMaskSource.get()=='R') shader.define('ALPHA_MASK_R');
        else shader.removeDefine('ALPHA_MASK_R');

    if(alphaMaskSource.get()=='G') shader.define('ALPHA_MASK_G');
        else shader.removeDefine('ALPHA_MASK_G');

    if(alphaMaskSource.get()=='B') shader.define('ALPHA_MASK_B');
        else shader.removeDefine('ALPHA_MASK_B');
}
alphaMaskSource.onChange=updateAlphaMaskMethod;

function updateAlphaTexture()
{

    if(inAlphaTexture.get())
    {
        if(alphaTextureUniform !== null) return;
        shader.removeUniform('texAlpha');
        shader.define('HAS_TEXTURE_ALPHA');
        if(!alphaTextureUniform) alphaTextureUniform = new CGL.Uniform(shader,'t','texAlpha', 5);

        alphaMaskSource.setUiAttribs({greyout:false});
        discardTransPxl.setUiAttribs({greyout:false});
        texCoordAlpha.setUiAttribs({greyout:false});

    }
    else
    {
        shader.removeUniform('texAlpha');
        shader.removeDefine('HAS_TEXTURE_ALPHA');
        alphaTextureUniform = null;

        alphaMaskSource.setUiAttribs({greyout:true});
        discardTransPxl.setUiAttribs({greyout:true});
        texCoordAlpha.setUiAttribs({greyout:true});
    }
    updateAlphaMaskMethod();
};

discardTransPxl.onChange=function()
{
    if(discardTransPxl.get()) shader.define('DISCARDTRANS');
        else shader.removeDefine('DISCARDTRANS');
};


texCoordAlpha.onChange=function()
{
    if(texCoordAlpha.get()) shader.define('TRANSFORMALPHATEXCOORDS');
        else shader.removeDefine('TRANSFORMALPHATEXCOORDS');
};


inDiffuseTexture.onChange = updateDiffuseTexture;
inSpecularTexture.onChange = updateSpecularTexture;
inNormalTexture.onChange = updateNormalTexture;
inAoTexture.onChange = updateAoTexture;
inEmissiveTexture.onChange = updateEmissiveTexture;
inAlphaTexture.onChange = updateAlphaTexture;

const MAX_UNIFORM_FRAGMENTS = cgl.gl.getParameter(cgl.gl.MAX_FRAGMENT_UNIFORM_VECTORS);
const MAX_LIGHTS = MAX_UNIFORM_FRAGMENTS === 64 ? 7 : 16;

shader.define('MAX_LIGHTS', MAX_LIGHTS.toString());
shader.define("SPECULAR_PHONG");
shader.bindTextures = bindTextures;

const LIGHT_TYPES = {
    none: -1,
    ambient: 0,
    point: 1,
    directional: 2,
    spot: 3,
};

inSpecularMode.onChange = function() {
    if (inSpecularMode.get() === "Phong") {
        shader.define("SPECULAR_PHONG");
        shader.removeDefine("SPECULAR_BLINN");
        shader.removeDefine("SPECULAR_GAUSS");
        shader.removeDefine("SPECULAR_SCHLICK");
    } else if (inSpecularMode.get() === "Blinn") {
        shader.define("SPECULAR_BLINN");
        shader.removeDefine("SPECULAR_PHONG");
        shader.removeDefine("SPECULAR_GAUSS");
        shader.removeDefine("SPECULAR_SCHLICK");
    } else if (inSpecularMode.get() === "Gauss") {
        shader.define("SPECULAR_GAUSS");
        shader.removeDefine("SPECULAR_BLINN");
        shader.removeDefine("SPECULAR_PHONG");
        shader.removeDefine("SPECULAR_SCHLICK");
    } else if (inSpecularMode.get() === "Schlick") {
        shader.define("SPECULAR_SCHLICK");
        shader.removeDefine("SPECULAR_BLINN");
        shader.removeDefine("SPECULAR_PHONG");
        shader.removeDefine("SPECULAR_GAUSS");
    }
}

inEnergyConservation.onChange = function() {
    shader.toggleDefine("CONSERVE_ENERGY", inEnergyConservation.get());
}

inToggleDoubleSided.onChange = function () {
    shader.toggleDefine("DOUBLE_SIDED", inToggleDoubleSided.get());
}

// * INIT UNIFORMS *
const initialUniforms = [
    new CGL.Uniform(shader, "4f", "inMaterialProperties", inAlbedo, inRoughness, inShininess, inSpecularCoefficient),
    new CGL.Uniform(shader, "4f", "inDiffuseColor", inDiffuseR, inDiffuseG, inDiffuseB, inDiffuseA),
    new CGL.Uniform(shader, "4f", "inTextureIntensities", inNormalIntensity, inAoIntensity, inSpecularIntensity, inEmissiveIntensity),
    new CGL.Uniform(shader, "4f", "inTextureRepeatOffset", inDiffuseRepeatX, inDiffuseRepeatY, inTextureOffsetX, inTextureOffsetY),
    new CGL.Uniform(shader, "4f", "inFresnel", inFresnelR, inFresnelG, inFresnelB, inFresnel),
    new CGL.Uniform(shader, "2f", "inFresnelWidthExponent", inFresnelWidth, inFresnelExponent),

];

const lightUniforms = [];
const vertexLightUniforms = [];

const initialLight = new Light({
    type: "point",
    color: [0.8, 0.8, 0.8],
    specular: [1, 1, 1],
    position: [0, 2, 2.75],
    intensity: 1,
    radius: 15,
    falloff: 0.2,
    cosConeAngleInner: null,
    spotExponent: null,
    coneAngle: null,
    conePointAt: null,
});

for (let i = 0; i < MAX_LIGHTS; i += 1) {
    const lightProperties = [
        i === 0 ? initialLight.intensity : 0,
        i === 0 ? initialLight.radius : 0,
        i === 0 ? initialLight.falloff : 0
        ];
    const lightPropertiesUniform = new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".lightProperties", lightProperties);
    const spotProperties = [null, null, null];
    const spotPropertiesUniform = new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".spotProperties", spotProperties);

    lightUniforms.push({
        color: new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".color", i === 0 ? initialLight.color : [0, 0, 0]),

        specular: new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".specular", i === 0 ? initialLight.specular : [1, 1, 1]),

        position: new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".position", i === 0 ? initialLight.position : [0, 0, 0]),

        type: new CGL.Uniform(shader, "i", "lights" + "[" + i + "]" + ".type", i === 0 ? LIGHT_TYPES.point : LIGHT_TYPES.none),

        lightProperties: lightPropertiesUniform,
        intensity: true,
        radius: true,
        falloff: true,

        /* SPOT LIGHT */
        spotProperties: spotPropertiesUniform,
        spotExponent: true,
        cosConeAngle: true,
        cosConeAngleInner: true,
        conePointAt: new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".conePointAt", null)
    });

    vertexLightUniforms.push({
        position: new CGL.Uniform(shader, "3f", "vertexLights" + "[" + i + "]" + ".position", i === 0 ? initialLight.position : [0, 0, 0]),
        type: new CGL.Uniform(shader, "i", "vertexLights" + "[" + i + "]" + ".type", i === 0 ? LIGHT_TYPES.point : LIGHT_TYPES.none),
    })
};

const render = function() {
    if (!shader) {
        op.log("NO SHADER");
        return;
    }
    cgl.setShader(shader);
    shader.bindTextures();
    outTrigger.trigger();
    cgl.setPreviousShader();
}

op.init = function() {

}

op.preRender = function() {
    shader.bind();
    render();
}

/* transform for default light */
const inverseViewMat = mat4.create();
const vecTemp = vec3.create();
const camPos = vec3.create();

inTrigger.onTriggered = function() {
    if (cgl.lightStack) {
        if (cgl.lightStack.length === 0) {
            op.setError("Default light is enabled. Please add lights to your patch to make this warning disappear.");
            // if there is no lights in the stack, we set the material back to its initialLight
            for (let i = 0; i < lightUniforms.length; i += 1) {
                if (i === 0) {
                    const keys = Object.keys(initialLight);
                    for (let j = 0; j < keys.length; j += 1) {
                        const key = keys[j];
                        if (key === "type") {
                            lightUniforms[i][key].setValue(LIGHT_TYPES[initialLight[key]]);
                            vertexLightUniforms[i][key].setValue(LIGHT_TYPES[initialLight[key]]);
                        } else {
                            if (vertexLightUniforms[i][key]) {
                              if (key === "position") {
                                    mat4.invert(inverseViewMat, cgl.vMatrix);
                                    vec3.transformMat4(camPos, vecTemp, inverseViewMat);
                                    vertexLightUniforms[i].position.setValue(camPos);
                              }
                            }
                            if (lightUniforms[i][key]) {
                                if (key === "radius" || key === "intensity" || key === "falloff") {
                                    lightUniforms[i].lightProperties.setValue([initialLight.intensity, initialLight.radius, initialLight.falloff]);
                                }
                                else if (key === "spotExponent" || key === "cosConeAngle" || key === "cosConeAngleInner") {
                                        lightUniforms[i].spotProperties.setValue([null, null, null]);
                                }
                                else if (key === "position") {
                                    /* transform for default light */
                                    mat4.invert(inverseViewMat, cgl.vMatrix);
                                    vec3.transformMat4(camPos, vecTemp, inverseViewMat);
                                    lightUniforms[i].position.setValue(camPos);

                                }
                                else {
                                    lightUniforms[i][key].setValue(initialLight[key]);
                                }
                            }
                        }

                    }
                } else {
                    lightUniforms[i].type.setValue(LIGHT_TYPES.none);
                }
            }
            render();
        } else {
            // we have lights in the stack
            op.setError(null);
            for (let i = 0; i < MAX_LIGHTS; i += 1) {
                const light = cgl.lightStack[i];
                if (!light) {
                    lightUniforms[i].type.setValue(LIGHT_TYPES.none);
                    continue;
                }

                const keys = Object.keys(light);
                for (let j = 0; j < keys.length; j += 1) {
                    const key = keys[j];
                    if (key === "type") {
                        lightUniforms[i][key].setValue(LIGHT_TYPES[light[key]]);
                        vertexLightUniforms[i][key].setValue(LIGHT_TYPES[light[key]]);
                    }
                    else {
                        if (lightUniforms[i][key]) {
                            if (key === "radius" || key === "intensity" || key === "falloff") {
                                lightUniforms[i].lightProperties.setValue([light.intensity, light.radius, light.falloff]);
                            }
                            else if (key === "spotExponent" || key === "cosConeAngle" || key === "cosConeAngleInner") {
                                lightUniforms[i].spotProperties.setValue([light.spotExponent, light.cosConeAngle, light.cosConeAngleInner]);
                            }
                            else lightUniforms[i][key].setValue(light[key]);
                        }
                        if (vertexLightUniforms[i][key]) {
                            vertexLightUniforms[i][key].setValue(light[key]);
                        }

                    }
                }
            }
        render();
        }
    } else {
        cgl.lightStack = [];
    }
}

updateDiffuseTexture();
updateSpecularTexture();
updateNormalTexture();
updateAoTexture();
updateAlphaTexture();

