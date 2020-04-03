const LIGHT_TYPES = { ambient: 0, point: 1, directional: 2, spot: 3 };

const execute=op.inTrigger("Execute");
const r = op.inValueSlider("Diffuse R", Math.random());
const g = op.inValueSlider("Diffuse G", Math.random());
const b = op.inValueSlider("Diffuse B", Math.random());
const a = op.inValueSlider("Diffuse A", 1.0);
r.setUiAttribs({ colorPick: true });
op.setPortGroup("Diffuse Color", [r, g, b, a]);
const inToggleDoubleSided = op.inBool("Double Sided", false);
inToggleDoubleSided.setUiAttribs({ hidePort: true });
inToggleDoubleSided.onChange = function () {
    shader.toggleDefine("DOUBLE_SIDED", inToggleDoubleSided.get());
};
op.setPortGroup("Material Properties", [inToggleDoubleSided]);

const inDiffuseTexture = op.inTexture("Diffuse Texture");
let diffuseTextureUniform = null;
let textureTransformsUniform = null;
inDiffuseTexture.onChange = updateDiffuseTexture

// TEXTURE TRANSFORMS
const inColorizeTexture = op.inBool("Colorize Texture",false);
inColorizeTexture.setUiAttribs({ hidePort: true });
inColorizeTexture.onChange = function() {
    shader.toggleDefine("COLORIZE_TEXTURE", inColorizeTexture.get());
}

op.setPortGroup("Texture & Transforms", [
    inDiffuseTexture,
    inColorizeTexture
]);

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

const next=op.outTrigger("next");


const cgl=op.patch.cgl;
const shader=new CGL.Shader(cgl,"LambertMaterial");
shader.define('NUM_LIGHTS','1');

const colUni=new CGL.Uniform(shader,'4f','materialColor',r,g,b,a);

var outShader=op.outObject("Shader");
outShader.set(shader);

const MAX_UNIFORM_FRAGMENTS = cgl.gl.getParameter(cgl.gl.MAX_FRAGMENT_UNIFORM_VECTORS);
const MAX_LIGHTS = MAX_UNIFORM_FRAGMENTS === 64 ? 6 : 16;

shader.setSource(attachments.lambert_vert,attachments.lambert_frag);

const DEFAULT_LIGHTSTACK = [{
   type: "point",
   position: [0, 2, 1],
   intensity: 1,
   attenuation: 0,
   falloff: 0.5,
   radius: 80,
}];


shader.define('MAX_LIGHTS', MAX_LIGHTS.toString());

let defaultUniform = null;

function createDefaultUniform() {
    defaultUniform = {
        color: new CGL.Uniform(shader,'3f','lights[0].color', [1,1,1]),
        position: new CGL.Uniform(shader,'3f','lights[0].position',[0,11,0]),

        // intensity, attenuation, falloff, radius
        lightProperties: new CGL.Uniform(shader, '4f', 'lights[0].lightProperties', [1,1,1,1]),
        type: new CGL.Uniform(shader, 'i', 'lights[0].type', 0),
        conePointAt: new CGL.Uniform(shader,'3f','lights[0].conePointAt', vec3.create()),
        spotProperties: new CGL.Uniform(shader, '3f', 'lights[0].spotProperties', [0,0,0,0]),
    }
}

function setDefaultUniform(light) {
        shader.define("NUM_LIGHTS", "1");
        defaultUniform.position.setValue(light.position);
        defaultUniform.color.setValue(light.color);

        defaultUniform.lightProperties.setValue([
            light.intensity,
            light.attenuation,
            light.falloff,
            light.radius,
        ]);
        defaultUniform.type.setValue(LIGHT_TYPES[light.type]);

        defaultUniform.conePointAt.setValue(light.conePointAt);
        defaultUniform.spotProperties.setValue([
            light.cosConeAngle,
            light.cosConeAngleInner,
            light.spotExponent,
        ]);
}

const lightUniforms = [];

function createUniforms(lightsCount) {
    for (let i = 0; i < lightUniforms.length; i += 1) {
        lightUniforms[i] = null;
    }

    for (let i = 0; i < lightsCount; i += 1) {
        if (i === MAX_LIGHTS) return;
        lightUniforms[i] = null;
        if (!lightUniforms[i]) {
            lightUniforms[i] = {
                color: new CGL.Uniform(shader,'3f','lights[' + i + '].color', [1,1,1]),
                position: new CGL.Uniform(shader,'3f','lights[' + i + '].position',[0,11,0]),
                // intensity, attenuation, falloff, radius
                lightProperties: new CGL.Uniform(shader, '4f', 'lights[' + i + '].lightProperties', [1,1,1,1]),
                type: new CGL.Uniform(shader, 'i', 'lights[' + i + '].type', 0),
                conePointAt: new CGL.Uniform(shader,'3f','lights[' + i + '].conePointAt', vec3.create()),
                spotProperties: new CGL.Uniform(shader, '3f', 'lights[' + i + '].spotProperties', [0,0,0,0]),
            };
        }
    }
}

function setUniforms(lightStack) {
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
        lightUniforms[i].type.setValue(LIGHT_TYPES[light.type]);

        lightUniforms[i].conePointAt.setValue(light.conePointAt);
        lightUniforms[i].spotProperties.setValue([
            light.cosConeAngle,
            light.cosConeAngleInner,
            light.spotExponent,
        ]);
    }
}

let oldCount = 0;
function compareLights(lightStack) {
    if (lightStack.length !== oldCount) {
        createUniforms(lightStack.length);
        oldCount = lightStack.length;
        shader.define('NUM_LIGHTS','' + Math.max(oldCount, 1));
        setUniforms(lightStack);
    } else {
        setUniforms(lightStack);
        return;
    }
}
const iViewMatrix = mat4.create();

function updateLights() {
    if((!cgl.frameStore.lightStack || !cgl.frameStore.lightStack.length)) {
        // if no light in light stack, use default light & set count to -1
        // so when a new light gets added, the shader does recompile
        if (!defaultUniform) createDefaultUniform();

        mat4.invert(iViewMatrix,cgl.vMatrix);
        // set default light position to camera position
        DEFAULT_LIGHTSTACK[0].position = [iViewMatrix[12], iViewMatrix[13], iViewMatrix[14]];

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
    if(!shader)
    {
        op.log("lambert has no shader...");
        return;
    }

    cgl.pushShader(shader);
    shader.popTextures();
    updateLights();
    if (inDiffuseTexture.get()) shader.pushTexture(diffuseTextureUniform, inDiffuseTexture.get().tex);

    next.trigger();
    cgl.popShader();
};

updateDiffuseTexture();