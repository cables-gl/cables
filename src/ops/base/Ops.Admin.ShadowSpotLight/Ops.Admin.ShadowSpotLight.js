const cgl = op.patch.cgl;
function Light(config) {
     this.type = config.type || "point";
     this.color = config.color || [1, 1, 1];
     this.specular = config.specular || [0, 0, 0];
     this.position = config.position || null;
     this.intensity = config.intensity || 1;
     this.radius = config.radius || 1;
     this.falloff = config.falloff || 1;
     this.spotExponent = config.spotExponent || 1;
     this.cosConeAngleInner = config.cosConeAngleInner || 0; // spot light
     this.cosConeAngle = config.cosConeAngle || 0;
     this.conePointAt = config.conePointAt || [0, 0, 0];
     this.castShadow = config.castShadow || false;
     this.nearFar = [0, 0];
     return this;
}

cgl.addEventListener("resize", () => op.log("canvas resized."));
// * OP START *
const inTrigger = op.inTrigger("Trigger In");

const inIntensity = op.inFloat("Intensity", 5);
const inRadius = op.inFloat("Radius", 10);

const inPosX = op.inFloat("X", 1);
const inPosY = op.inFloat("Y", 2);
const inPosZ = op.inFloat("Z", 1);

const positionIn = [inPosX, inPosY, inPosZ];
op.setPortGroup("Position", positionIn);

const inPointAtX = op.inFloat("Point At X", 0);
const inPointAtY = op.inFloat("Point At Y", 0);
const inPointAtZ = op.inFloat("Point At Z", 0);
const pointAtIn = [inPointAtX, inPointAtY, inPointAtZ];
op.setPortGroup("Point At", pointAtIn);

const inR = op.inFloatSlider("R", 1);
const inG = op.inFloatSlider("G", 1);
const inB = op.inFloatSlider("B", 1);
inR.setUiAttribs({ colorPick: true });
const colorIn = [inR, inG, inB];
op.setPortGroup("Color", colorIn);

const inSpecularR = op.inFloatSlider("Specular R", 1);
const inSpecularG = op.inFloatSlider("Specular G", 1);
const inSpecularB = op.inFloatSlider("Specular B", 1);
inSpecularR.setUiAttribs({ colorPick: true });
const colorSpecularIn = [inSpecularR, inSpecularG, inSpecularB];
op.setPortGroup("Specular Color", colorSpecularIn);

const inConeAngle = op.inFloat("Cone Angle", 130);
const inConeAngleInner = op.inFloat("Inner Cone Angle", 60);
const inSpotExponent = op.inFloat("Spot Exponent", 0.97);
const coneAttribsIn = [inConeAngle, inConeAngleInner, inSpotExponent];
op.setPortGroup("Cone Attributes", coneAttribsIn);

const inFalloff = op.inFloatSlider("Falloff", 0.00001);
const lightAttribsIn = [inIntensity, inRadius ];
op.setPortGroup("Light Attributes", lightAttribsIn);

const inCastShadow = op.inBool("Cast Shadow", false);
const inMapSize = op.inSwitch("Map Size",[256, 512, 1024, 2048], 512);

const inNear = op.inFloat("Near", 0.1);
const inFar = op.inFloat("Far", 30);
const inBias = op.inFloatSlider("Bias", 0.004);
const inPolygonOffset = op.inInt("Polygon Offset", 1);
const inNormalOffset = op.inFloatSlider("Normal Offset", 0.027);
const inBlur = op.inFloatSlider("Blur Amount", 1);
op.setPortGroup("",[inCastShadow]);
op.setPortGroup("Shadow Map Settings",[inMapSize, inNear, inFar, inBias, inPolygonOffset, inNormalOffset, inBlur]);


inMapSize.setUiAttribs({ greyout: true, hidePort: true });
inNear.setUiAttribs({ greyout: true, hidePort: true });
inFar.setUiAttribs({ greyout: true, hidePort: true });
inBlur.setUiAttribs({ greyout: true, hidePort: true });
inPolygonOffset.setUiAttribs({ greyout: true, hidePort: true });
inNormalOffset.setUiAttribs({ greyout: true, hidePort: true });
inBias.setUiAttribs({ greyout: true, hidePort: true });

const inAdvanced = op.inBool("Enable Advanced", false);
const inMSAA = op.inSwitch("MSAA",["none", "2x", "4x", "8x"], "none");
const inFilterType = op.inSwitch("Texture Filter",['Linear', 'Anisotropic', 'Mip Map'], 'Linear');
const inAnisotropic = op.inSwitch("Anisotropic", [0, 1, 2, 4, 8, 16], '0');
const inTest = op.inFloat("Test", 1);
inMSAA.setUiAttribs({ greyout: true, hidePort: true });
inFilterType.setUiAttribs({ greyout: true, hidePort: true });
inAnisotropic.setUiAttribs({ greyout: true, hidePort: true });
inTest.setUiAttribs({ greyout: true, hidePort: true });
op.setPortGroup("Advanced Options",[inAdvanced, inMSAA, inFilterType, inAnisotropic, inTest]);

inCastShadow.setUiAttribs({ hidePort: true });
inAdvanced.setUiAttribs({ hidePort: true });

inAdvanced.onChange = function() {
    if (inAdvanced.get()) {
        inMSAA.setUiAttribs({ greyout: false });
        inFilterType.setUiAttribs({ greyout: false });
    } else {
        inMSAA.setUiAttribs({ greyout: true });
        inFilterType.setUiAttribs({ greyout: true });
        inMSAA.setValue("none");
        inAnisotropic.setUiAttribs({ greyout: true });
        inTest.setUiAttribs({ greyout: true });
    }
};

const outTrigger = op.outTrigger("Trigger Out");
const outTexture = op.outTexture("Shadow Map");

// * SHADER *
const shader = new CGL.Shader(cgl, "shadowSpotLight");
shader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
shader.setSource(attachments.spotlight_shadowpass_vert, attachments.spotlight_shadowpass_frag);
const blurShader = new CGL.Shader(cgl, "shadowSpotBlur");
blurShader.setSource(attachments.spotlight_blur_vert, attachments.spotlight_blur_frag);

var texelSize = 1/Number(inMapSize.get());
const uniformTexture = new CGL.Uniform(blurShader,'t','shadowMap', 0);
const uniformTexelSize = new CGL.Uniform(blurShader, 'f', 'texelSize', texelSize);
const uniformXY = new CGL.Uniform(blurShader, "2f", "inXY", null);
const uniformLightPosition = new CGL.Uniform(shader, '3f', "lightPosition", vec3.create());


// * FRAMEBUFFER *
var fb = null;
let x, y;

const IS_WEBGL_1 = cgl.glVersion == 1;

if (IS_WEBGL_1) {
    cgl.gl.getExtension('OES_texture_float');
    cgl.gl.getExtension('OES_texture_float_linear');
    cgl.gl.getExtension('OES_texture_half_float');
    cgl.gl.getExtension('OES_texture_half_float_linear');

    shader.enableExtension("GL_OES_standard_derivatives");
    shader.enableExtension("GL_OES_texture_float");
    shader.enableExtension("GL_OES_texture_float_linear");
    shader.enableExtension("GL_OES_texture_half_float");
    shader.enableExtension("GL_OES_texture_half_float_linear");
    /*
    cgl.gl.getExtension("OES_standard_derivatives");
    cgl.gl.getExtension('EXT_shader_texture_lod');
    */
    fb = new CGL.Framebuffer(cgl, Number(inMapSize.get()), Number(inMapSize.get()), {
        isFloatingPointTexture: true,
        filter: CGL.Texture.FILTER_LINEAR,
        wrap: CGL.Texture.WRAP_CLAMP_TO_EDGE
    });
}
else {
    fb = new CGL.Framebuffer2(cgl,Number(inMapSize.get()),Number(inMapSize.get()), {
        isFloatingPointTexture: true,
        filter: CGL.Texture.FILTER_LINEAR,
        wrap: CGL.Texture.WRAP_CLAMP_TO_EDGE,
    });
}
var effect = new CGL.TextureEffect(cgl, {
    isFloatingPointTexture: true ,
    filter: CGL.Texture.FILTER_LINEAR,
    wrap: CGL.Texture.WRAP_CLAMP_TO_EDGE,
});
op.log("aminakoyum", cgl.gl.getSupportedExtensions());

function updateBuffers() {
        const MSAA = Number(inMSAA.get().charAt(0));

    if (fb) fb.delete();
    if (effect) effect.delete();

    let filterType = null;
    let anisotropicFactor = undefined;

    if (inFilterType.get() == "Linear") {
        filterType = CGL.Texture.FILTER_LINEAR;
    } else if (inFilterType.get() == "Anisotropic") {
        filterType = CGL.Texture.FILTER_LINEAR;
        anisotropicFactor = Number(inAnisotropic.get());
    } else if (inFilterType.get() == "Mip Map") {
        filterType = CGL.Texture.FILTER_MIPMAP;
    }

    const mapSize = Number(inMapSize.get());
    const textureOptions = {
        isFloatingPointTexture: true,
        filter: filterType,
    };


    if (MSAA) Object.assign(textureOptions, { multisampling: true, multisamplingSamples: MSAA });
    if (anisotropicFactor !== undefined) Object.assign(textureOptions, { anisotropic: anisotropicFactor });
    if (cgl.glVersion == 1) {
        fb = new CGL.Framebuffer(cgl, mapSize, mapSize, textureOptions);
    } else {
        fb = new CGL.Framebuffer2(cgl, mapSize, mapSize, textureOptions);
        effect = new CGL.TextureEffect(cgl, textureOptions);
    }
}

inMSAA.onChange = inAnisotropic.onChange = updateBuffers;

inFilterType.onChange = function() {
    if (inFilterType.get() === "Anisotropic") {
        inAnisotropic.setUiAttribs({ greyout: false });
        inTest.setUiAttribs({ greyout: false });

    } else {
        inAnisotropic.setUiAttribs({ greyout: true });
        inTest.setUiAttribs({ greyout: true });
    }

    updateBuffers();
};

const inLight = {
  position: positionIn,
  conePointAt: pointAtIn,
  color: colorIn,
  specular: colorSpecularIn,
  intensity: inIntensity,
  radius: inRadius,
  falloff: inFalloff,
  cosConeAngle: inConeAngle,
  cosConeAngleInner: inConeAngleInner,
  spotExponent: inSpotExponent
};


const light = new Light({
    type: "spot",
    position: [0, 1, 2].map(function(i){ return positionIn[i].get() }),
    color: [0 , 1, 2].map(function(i) { return colorIn[i].get() }),
    specular: [0 , 1, 2].map(function(i) { return colorSpecularIn[i].get() }),
    conePointAt: [0, 1, 2].map(function(i) { return pointAtIn[i].get() }),
    intensity: inIntensity.get(),
    radius: inRadius.get(),
    falloff: inFalloff.get(),
    cosConeAngleInner: Math.cos(CGL.DEG2RAD * inConeAngleInner.get()),
    cosConeAngle: Math.cos(CGL.DEG2RAD * inConeAngle.get()),
    spotExponent: inSpotExponent.get(),
    castShadow: false,
});

Object.keys(inLight).forEach(function(key) {
    if (inLight[key].length) {
        for (let i = 0; i < inLight[key].length; i += 1) {
            inLight[key][i].onChange = function() {
                light[key][i] = inLight[key][i].get();
            }
        }
    } else {
        if (inLight[key]) {
        inLight[key].onChange = function() {
            if (key === "coneAngle" || key === "coneAngleInner") {
                light[key] = CGL.DEG2RAD*inLight[key].get();
                if (key === "coneAngle") updateProjectionMatrix();
            } else if (key === "cosConeAngle") {
                light[key] = Math.cos(CGL.DEG2RAD*(inLight[key].get()));
                updateProjectionMatrix();

            }
            else if (key === "cosConeAngleInner") {
                light[key] = Math.cos(CGL.DEG2RAD*(inLight[key].get()));
            }
            else light[key] = inLight[key].get();
        }
    }
    }
});

inMapSize.onChange = function() {
    const size = Number(inMapSize.get());
    fb.setSize(size, size);
    texelSize = 1 / size;
    uniformTexelSize.setValue(texelSize);
}


inCastShadow.onChange = function() {
    const castShadow = inCastShadow.get();
    light.castShadow = castShadow;
    if (castShadow) {
        inMapSize.setUiAttribs({ greyout: false });
        inNear.setUiAttribs({ greyout: false });
        inFar.setUiAttribs({ greyout: false });
        inNormalOffset.setUiAttribs({ greyout: false });
        inBlur.setUiAttribs({ greyout: false });
        inBias.setUiAttribs({ greyout: false });
        inPolygonOffset.setUiAttribs({ greyout: false });

    } else {
        inMapSize.setUiAttribs({ greyout: true });
        inNear.setUiAttribs({ greyout: true });
        inFar.setUiAttribs({ greyout: true });
        inNormalOffset.setUiAttribs({ greyout: true });
        inBlur.setUiAttribs({ greyout: true });
        inBias.setUiAttribs({ greyout: true });
        inPolygonOffset.setUiAttribs({ greyout: true });
        outTexture.set(null);
    }
}

const lightProjectionMatrix = mat4.create();
mat4.perspective(
    lightProjectionMatrix,
    2 * CGL.DEG2RAD * inLight.cosConeAngle.get(),
    1,
    inNear.get(),
    inFar.get()
);

function updateProjectionMatrix() {
        mat4.perspective(
        lightProjectionMatrix,
        //CGL.DEG2RAD * inFOV.get(),
        CGL.DEG2RAD * inLight.cosConeAngle.get(),
        1,
        inNear.get(),
        inFar.get()
    );
}

inNear.onChange = inFar.onChange = updateProjectionMatrix;

// * init vectors & matrices
const lookAt = vec3.fromValues(0, 0, 0);
const up = vec3.fromValues(0, 1, 0);
const camPos = vec3.create();

const identityMat = mat4.create();
const biasMatrix = mat4.fromValues(
        0.5, 0.0, 0.0, 0.0,
        0.0, 0.5, 0.0, 0.0,
        0.0, 0.0, 0.5, 0.0,
        0.5, 0.5, 0.5, 1.0);
const lightBiasMVPMatrix = mat4.create();


function renderBlur() {
    cgl.setShader(blurShader);

    effect.setSourceTexture(fb.getTextureColor()); // take shadow map as source
    effect.startEffect();


    effect.bind();
    cgl.setTexture(0, effect.getCurrentSourceTexture().tex);

    uniformXY.setValue([1.5 * inBlur.get() * texelSize, 0]);
    effect.finish();

    effect.bind();

     cgl.setTexture(0, effect.getCurrentSourceTexture().tex);

    uniformXY.setValue([0, 1.5 * inBlur.get() * texelSize]);


    effect.finish();

    effect.endEffect();

    cgl.setPreviousShader();
}

shader.offScreenPass = true;
blurShader.offScreenPass = true;
function renderShadowMap() {
    // * set shader

    cgl.setShader(shader);

    cgl.pushModelMatrix();
    cgl.pushViewMatrix();
    cgl.pushPMatrix();

    fb.renderStart(cgl);
    /* */
    // * calculate matrices & camPos vector
    vec3.set(camPos, light.position[0], light.position[1], light.position[2]);
    mat4.copy(cgl.mMatrix, identityMat); // M

    vec3.set(lookAt, light.conePointAt[0], light.conePointAt[1], light.conePointAt[2]);
    mat4.lookAt(cgl.vMatrix, camPos, lookAt, up); // V

    mat4.copy(cgl.pMatrix, lightProjectionMatrix); // P

    // * create light mvp bias matrix
    mat4.mul(lightBiasMVPMatrix, cgl.pMatrix, cgl.vMatrix);
    mat4.mul(lightBiasMVPMatrix, cgl.mMatrix, lightBiasMVPMatrix);
    mat4.mul(lightBiasMVPMatrix, biasMatrix, lightBiasMVPMatrix);

    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);
    outTrigger.trigger();

    fb.renderEnd(cgl);



    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();

    cgl.setPreviousShader();
}




const position = vec3.create();
const pointAtPos = vec3.create();
const resultPos = vec3.create();
const resultPointAt = vec3.create();

function drawHelpers() {
        if(op.patch.isEditorMode() && (CABLES.UI.renderHelper || gui.patch().isCurrentOp(op))) {
        gui.setTransformGizmo({
            posX:inPosX,
            posY:inPosY,
            posZ:inPosZ,
        });
        /*
        CABLES.GL_MARKER.drawLineSourceDest({
            op: op,
            sourceX: light.position[0],
            sourceY: light.position[1],
            sourceZ: light.position[2],
            destX: light.conePointAt[0],
            destY: light.conePointAt[1],
            destZ: light.conePointAt[2],
        });
        */
    }
}

inTrigger.onTriggered = function() {
    if (!cgl.lightStack) cgl.lightStack = [];

    vec3.set(position, inPosX.get(), inPosY.get(), inPosZ.get());
    vec3.set(pointAtPos, inPointAtX.get(), inPointAtY.get(), inPointAtZ.get());

    vec3.transformMat4(resultPos, position, cgl.mMatrix);
    vec3.transformMat4(resultPointAt, pointAtPos, cgl.mMatrix);

    light.position = resultPos;
    light.conePointAt = resultPointAt;
    uniformLightPosition.setValue(light.position);

    drawHelpers();

    cgl.lightStack.push(light);
    if (inCastShadow.get()) {
        if (!cgl.shadowPass) {
            if (fb) {
                cgl.gl.enable(cgl.gl.CULL_FACE);
                cgl.gl.cullFace(cgl.gl.FRONT);

                cgl.gl.enable(cgl.gl.POLYGON_OFFSET_FILL);
                cgl.gl.polygonOffset(inPolygonOffset.get(), inPolygonOffset.get());
                // cgl.gl.enable(cgl.gl.DEPTH_TEST); disabled so not rendering blur doesnt give black texture

                cgl.frameStore.renderOffscreen = true;
                cgl.shadowPass = true;

                /*
                if (!cgl.firstShadowPass) {
                    // https://github.com/haedri/shadow-mapping/wiki/Part-4-%3A-multiple-lights%2C-forward-rendering
                    // https://gamedev.stackexchange.com/questions/110202/multiple-lights-shadows
                    //

                    cgl.gl.enable(cgl.gl.BLEND);
                    cgl.gl.blendFunc(cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA);

                }
                */
                cgl.gl.colorMask(true,true,false,false);
                renderShadowMap();
                //cgl.gl.colorMask(true,true,true,true);

                /*
                if (!cgl.firstShadowPass) {
                    cgl.gl.disable(cgl.gl.BLEND);

                    cgl.gl.blendFunc(cgl.gl.SRC_ALPHA, cgl.gl.ONE_MINUS_SRC_ALPHA);

                }
                */


                // cgl.gl.disable(cgl.gl.DEPTH_TEST);
                cgl.gl.cullFace(cgl.gl.BACK);
                cgl.gl.disable(cgl.gl.CULL_FACE);
                cgl.gl.disable(cgl.gl.POLYGON_OFFSET_FILL);

                // NOTE: blur is still very cpu intensive... idk why
                // cgl.gl.colorMask(true,true,false,false);
                if (inBlur.get() > 0 && !IS_WEBGL_1) renderBlur();
                cgl.gl.colorMask(true,true,true,true);


                cgl.shadowPass = false;
                cgl.frameStore.renderOffscreen = false;

                outTexture.set(null);
                outTexture.set(fb.getTextureDepth());

            }
        }
    }

    // remove light from stack and readd it with shadow map & mvp matrix
    cgl.lightStack.pop();
    light.lightMatrix = lightBiasMVPMatrix;
    light.castShadow = inCastShadow.get();
    light.shadowMap = fb.getTextureColor();
    light.shadowMapDepth = fb.getTextureDepth();
    light.normalOffset = inNormalOffset.get();
    light.shadowBias = inBias.get();


    cgl.lightStack.push(light);
    outTrigger.trigger();

    cgl.lightStack.pop();
}
