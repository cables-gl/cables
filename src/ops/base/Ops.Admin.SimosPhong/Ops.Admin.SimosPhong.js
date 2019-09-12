
function Light(config) {
     this.type = config.type || "point";
     this.color = config.color || [1, 1, 1];
     this.specular = config.specular || [0, 0, 0];
     this.position = config.position || null;
     this.intensity = config.intensity || 1;
     this.constantAttenuation = config.constantAttenuation || 0;
     this.linearAttenuation = config.linearAttenuation || 0;
     this.quadraticAttenuation = config.quadraticAttenuation || 0;
     this.spotExponent = config.spotExponent || 1;
     this.cosConeAngleInner = Math.cos(CGL.DEG2RAD*config.coneAngleInner) || 0; // spot light
     this.coneAngleInner = config.coneAngleInner;
     this.coneAngle = config.coneAngle || 0; // spot light
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
inDiffuseR.setUiAttribs({ colorPick: true });
const diffuseColors = [inDiffuseR, inDiffuseG, inDiffuseB, inDiffuseA];
op.setPortGroup("Color", diffuseColors);


// * SPECULAR *
const inShininess = op.inFloatSlider("Shininess", 1);
const inSpecularCoefficient = op.inFloatSlider("Specular Coefficient", 1);
const specularColors = [inShininess, inSpecularCoefficient];
op.setPortGroup("Specular", specularColors);



// * LIGHT *
const inBlinn = op.inValueBool("Blinn Reflection Model", false);
const inEnergyConservation = op.inValueBool("Energy Conservation", false);
const inToggleDoubleSided = op.inBool("Double Sided Material", false);
const lightProps = [inBlinn, inEnergyConservation, inToggleDoubleSided];
op.setPortGroup("Light Options", lightProps);

// TEXTURES
const inDiffuseTexture = op.inTexture("Diffuse Texture");
const inSpecularTexture = op.inTexture("Specular Texture");
const inNormalTexture = op.inTexture("Normal Map");
const inAoTexture = op.inTexture("AO Texture");
op.setPortGroup("Textures",[inDiffuseTexture, inSpecularTexture, inNormalTexture, inAoTexture]);

// TEXTURE TRANSFORMS
const inColorizeTexture = op.inBool("Colorize Texture",false);
const inDiffuseRepeatX = op.inFloat("Diffuse Repeat X", 0);
const inDiffuseRepeatY = op.inFloat("Diffuse Repeat Y", 0);
const inTextureOffsetX = op.inFloat("Texture Offset X", 0);
const inTextureOffsetY = op.inFloat("Texture Offset Y", 0);
const inNormalIntensity = op.inFloatSlider("Normal Map Intensity");
op.setPortGroup("Texture Transforms",[inNormalIntensity, inColorizeTexture, inDiffuseRepeatY, inDiffuseRepeatX, inTextureOffsetY, inTextureOffsetX]);
function bindTextures() {
    if(inDiffuseTexture.get()) cgl.setTexture(0, inDiffuseTexture.get().tex);
    if (inSpecularTexture.get()) cgl.setTexture(1, inSpecularTexture.get().tex);
    if(inNormalTexture.get()) cgl.setTexture(2, inNormalTexture.get().tex);
    if (inAoTexture.get()) cgl.setTexture(3, inAoTexture.get().tex);
}


const outTrigger = op.outTrigger("Trigger Out");
const outLength = op.outNumber("NUM_LIGHTS");
const shaderOut = op.outObject("Shader");
shaderOut.ignoreValueSerialize = true;


const shader = new CGL.Shader(cgl,"simosphong");
shader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
shader.setSource(attachments.simosphong_vert, attachments.simosphong_frag);

let diffuseTextureUniform = null;
let specularTextureUniform = null;
let normalTextureUniform = null;
let aoTextureUniform = null;

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
inDiffuseTexture.onChange = updateDiffuseTexture;
inSpecularTexture.onChange = updateSpecularTexture;
inNormalTexture.onChange = updateNormalTexture;
inAoTexture.onChange = updateAoTexture;

const MAX_LIGHTS = 16;

shader.define('MAX_LIGHTS',MAX_LIGHTS.toString());
shader.bindTextures = bindTextures;

const LIGHT_TYPES = {
    none: -1,
    ambient: 0,
    point: 1,
    directional: 2,
    spot: 3,
};

inBlinn.onChange = function() {
    shader.toggleDefine("SPECULAR_BLINN", inBlinn.get());
}

inEnergyConservation.onChange = function() {
    shader.toggleDefine("CONSERVE_ENERGY", inEnergyConservation.get());
}

inToggleDoubleSided.onChange = function () {
    shader.toggleDefine("DOUBLE_SIDED", inToggleDoubleSided.get());
}

// * INIT UNIFORMS *
const initialUniforms = [
    new CGL.Uniform(shader, "i", "numLights", MAX_LIGHTS),
    new CGL.Uniform(shader, "f", "inDiffuseR", inDiffuseR),
    new CGL.Uniform(shader, "f", "inDiffuseG", inDiffuseG),
    new CGL.Uniform(shader, "f", "inDiffuseB", inDiffuseB),
    new CGL.Uniform(shader, "f", "inAlpha", inDiffuseA),
    new CGL.Uniform(shader, "f", "shininess", inShininess),
    new CGL.Uniform(shader, "f", "inSpecularCoefficient", inSpecularCoefficient),
    new CGL.Uniform(shader, "f", "inNormalIntensity", inNormalIntensity),
    new CGL.Uniform(shader, "f", "inDiffuseRepeatX", inDiffuseRepeatX),
    new CGL.Uniform(shader, "f", "inDiffuseRepeatY", inDiffuseRepeatY),
    new CGL.Uniform(shader, "f", "inTextureOffsetX", inTextureOffsetX),
    new CGL.Uniform(shader, "f", "inTextureOffsetY", inTextureOffsetY),
];

const lightUniforms = [];
const initialLight = new Light({
    type: "point",
    color: [1, 1, 1],
    specular: [1, 1, 1],
    position: [-1, 2, 2],
    intensity: 0.3,
    radius: 10,
    falloff: 0.5,
    constantAttenuation: 0.01,
    linearAttenuation: 0.069,
    quadraticAttenuation: 0.001,
    coneAngleInner: null,
    cosConeAngleInner: null,
    coneAngleOuter: null,
    spotExponent: null,
    coneAngle: null,
    conePointAt: null,
});

for (let i = 0; i < MAX_LIGHTS; i += 1) {
    lightUniforms.push({
        type: new CGL.Uniform(shader, "i", "lights" + "[" + i + "]" + ".type", i === 0 ? LIGHT_TYPES.point : LIGHT_TYPES.none),
        color: new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".color", i === 0 ? initialLight.color : [0, 0, 0]),
        specular: new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".specular", i === 0 ? initialLight.specular : [1, 1, 1]),
        position: new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".position", i === 0 ? initialLight.position : [0, 0, 0]),
        intensity: new CGL.Uniform(shader, "f", "lights" + "[" + i + "]" + ".intensity", i === 0 ? initialLight.intensity : 0),
        constantAttenuation: new CGL.Uniform(shader, "f", "lights" + "[" + i + "]" + ".constantAttenuation", i === 0 ? initialLight.constantAttenuation : 0),
        linearAttenuation: new CGL.Uniform(shader, "f", "lights" + "[" + i + "]" + ".linearAttenuation", i === 0 ? initialLight.linearAttenuation : 0),
        quadraticAttenuation: new CGL.Uniform(shader, "f", "lights" + "[" + i + "]" + ".quadraticAttenuation", i === 0 ? initialLight.quadraticAttenuation : 0),
        radius: new CGL.Uniform(shader, "f", "lights" + "[" + i + "]" + ".radius", i === 0 ? initialLight.radius : 0),
        falloff: new CGL.Uniform(shader, "f", "lights" + "[" + i + "]" + ".falloff", i === 0 ? initialLight.falloff : 0),
        spotExponent: new CGL.Uniform(shader, "f", "lights" + "[" + i + "]" + ".spotExponent", null),
        coneAngleInner: new CGL.Uniform(shader, "f", "lights" + "[" + i + "]" + ".coneAngleInner", null),
        coneAngle: new CGL.Uniform(shader, "f", "lights" + "[" + i + "]" + ".coneAngle", null),
        cosConeAngle: new CGL.Uniform(shader, "f", "lights" + "[" + i + "]" + ".cosConeAngle", null),
        cosConeAngleInner: new CGL.Uniform(shader, "f", "lights" + "[" + i + "]" + ".cosConeAngleInner", null),
        conePointAt: new CGL.Uniform(shader, "3f", "lights" + "[" + i + "]" + ".conePointAt", null)
    });
};

const render = function() {
    if (!shader) {
        console.log("NO SHADER");
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

inTrigger.onTriggered = function() {
    if (cgl.lightStack) {
        if (cgl.lightStack.length === 0) {
            // if there is no lights in the stack, we set the material back to its initialLight
            for (let i = 0; i < lightUniforms.length; i += 1) {
                if (i === 0) {
                    const keys = Object.keys(initialLight);

                    for (let j = 0; j < keys.length; j += 1) {
                        if (keys[j] === "type") {
                            lightUniforms[i][keys[j]].setValue(LIGHT_TYPES[initialLight[keys[j]]]);
                        }
                        else {
                            lightUniforms[i][keys[j]].setValue(initialLight[keys[j]]);

                        }
                    }
                } else {
                    lightUniforms[i].type.setValue(LIGHT_TYPES.none);
                }
            }
            render();
        } else {
            // we have lights in the stack
            for (let i = 0; i < MAX_LIGHTS; i += 1) {
                const light = cgl.lightStack[i];
                if (!light) {
                    lightUniforms[i].type.setValue(LIGHT_TYPES.none);

                    continue;
                }

                const keys = Object.keys(light);

                for (let j = 0; j < keys.length; j += 1) {
                    if (keys[j] === "type") lightUniforms[i][keys[j]].setValue(LIGHT_TYPES[light[keys[j]]]);
                    else lightUniforms[i][keys[j]].setValue(light[keys[j]]);
                }
            }
        render();
        }
    }
}

updateDiffuseTexture();
updateSpecularTexture();
updateNormalTexture();
updateAoTexture();