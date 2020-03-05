const cgl = op.patch.cgl;

function Light(config) {
     this.type = config.type || "directional";
     this.color = config.color || [1, 1, 1];
     this.specular = config.specular || [0, 0, 0];
     this.position = config.position || null;
     this.intensity = config.intensity || 1;
     this.spotExponent = config.spotExponent || 1;
     this.cosConeAngleInner = Math.cos(CGL.DEG2RAD*config.coneAngleInner) || 0; // spot light
     this.coneAngleInner = config.coneAngleInner;
     this.coneAngle = config.coneAngle || 0; // spot light
     this.cosConeAngle = config.cosConeAngle || 0;
     this.conePointAt = config.conePointAt || [0, 0, 0];
     this.castShadow = config.castShadow || 0;
     this.nearFar = [0,0];
     return this;
}

// * OP START *
const inTrigger = op.inTrigger("Trigger In");
const inPosX = op.inFloat("X", 0);
const inPosY = op.inFloat("Y", 3);
const inPosZ = op.inFloat("Z", 5);

const positionIn = [inPosX, inPosY, inPosZ];
op.setPortGroup("Direction", positionIn);

const inR = op.inFloat("R", 1);
const inG = op.inFloat("G", 1);
const inB = op.inFloat("B", 1);

inR.setUiAttribs({ colorPick: true });
const colorIn = [inR, inG, inB];
op.setPortGroup("Color", colorIn);

const inSpecularR = op.inFloat("Specular R", 0.2);
const inSpecularG = op.inFloat("Specular G", 0.2);
const inSpecularB = op.inFloat("Specular B", 0.2);

inSpecularR.setUiAttribs({ colorPick: true });
const colorSpecularIn = [inSpecularR, inSpecularG, inSpecularB];
op.setPortGroup("Specular Color", colorSpecularIn);

const inIntensity = op.inFloat("Intensity", 1);
const attribIns = [inIntensity];
op.setPortGroup("Light Attributes", attribIns);

const inCastShadow = op.inBool("Cast Shadow", false);
const inMapSize = op.inSwitch("Map Size",[256, 512, 1024, 2048], 512);
const inShadowStrength = op.inFloatSlider("Shadow Strength", 1);
const inLRBT = op.inFloat("LR-BottomTop", 8);
const inNear = op.inFloat("Near", 0.1);
const inFar = op.inFloat("Far", 30);
const inBias = op.inFloatSlider("Bias", 0.004);
const inPolygonOffset = op.inInt("Polygon Offset", 1);
const inNormalOffset = op.inFloatSlider("Normal Offset", 0.024);
const inBlur = op.inFloatSlider("Blur Amount", 0);
op.setPortGroup("", [inCastShadow]);
op.setPortGroup("Shadow Map Settings",[inMapSize, inShadowStrength, inLRBT, inNear, inFar, inBias, inPolygonOffset, inNormalOffset, inBlur]);

inMapSize.setUiAttribs({ greyout: true, hidePort: true });
inShadowStrength.setUiAttribs({ greyout: true });
inLRBT.setUiAttribs({ greyout: true, hidePort: true });
inNear.setUiAttribs({ greyout: true, hidePort: true });
inFar.setUiAttribs({ greyout: true, hidePort: true });
inBias.setUiAttribs({ greyout: true, hidePort: true });
inNormalOffset.setUiAttribs({ greyout: true, hidePort: true });
inPolygonOffset.setUiAttribs({ greyout: true, hidePort: true });
inBlur.setUiAttribs({ greyout: true, hidePort: true });

const inAdvanced = op.inBool("Enable Advanced", false);
const inMSAA = op.inSwitch("MSAA",["none", "2x", "4x", "8x"], "none");
const inFilterType = op.inSwitch("Texture Filter",['Linear', 'Anisotropic', 'Mip Map'], 'Linear');
const inAnisotropic = op.inSwitch("Anisotropic", [0, 1, 2, 4, 8, 16], '0');
inMSAA.setUiAttribs({ greyout: true, hidePort: true });
inFilterType.setUiAttribs({ greyout: true, hidePort: true });
inAnisotropic.setUiAttribs({ greyout: true, hidePort: true });
op.setPortGroup("Advanced Options",[inAdvanced, inMSAA, inFilterType, inAnisotropic]);

inAdvanced.onChange = function() {
    if (inAdvanced.get()) {
        inMSAA.setUiAttribs({ greyout: false });
        inFilterType.setUiAttribs({ greyout: false });
    } else {
        inMSAA.setUiAttribs({ greyout: true });
        inFilterType.setUiAttribs({ greyout: true });
        inMSAA.setValue("none");
        inAnisotropic.setUiAttribs({ greyout: true });
    }
};

const outTrigger = op.outTrigger("Trigger Out");
const outTexture = op.outTexture("Shadow Map");


// * SHADER *
const shader = new CGL.Shader(cgl, "shadowDirLight");
shader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
shader.setSource(attachments.dirlight_shadowpass_vert, attachments.dirlight_shadowpass_frag);

const blurShader = new CGL.Shader(cgl, "shadowBlur");
blurShader.setSource(attachments.dirlight_blur_vert, attachments.dirlight_blur_frag);

var texelSize = 1/Number(inMapSize.get());
const uniformTexture = new CGL.Uniform(blurShader,'t','shadowMap', 0);
const uniformTexelSize = new CGL.Uniform(blurShader, 'f', 'texelSize', texelSize); // change with dropdown?
const uniformXY = new CGL.Uniform(blurShader, "2f", "inXY", null);

// * FRAMEBUFFER *
var fb = null;
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
    isFloatingPointTexture: true,
    filter: CGL.Texture.FILTER_LINEAR,
    wrap: CGL.Texture.WRAP_CLAMP_TO_EDGE,
});


const light = new Light({
    type: "directional",
    position: [0, 1, 2].map(function(i){ return positionIn[i].get() }),
    color: [0 , 1, 2].map(function(i) { return colorIn[i].get() }),
    specular: [0 , 1, 2].map(function(i) { return colorSpecularIn[i].get() }),
    intensity: inIntensity.get(),
    radius: null,
    falloff: null,
});


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
    } else {
        inAnisotropic.setUiAttribs({ greyout: true });
    }

    updateBuffers();
};

const inLight = {
  position: [inPosX, inPosY, inPosZ],
  color: [inR, inG, inB],
  specular: [inSpecularR, inSpecularG, inSpecularB],
  intensity: inIntensity,
};

Object.keys(inLight).forEach(function(key) {
    if (inLight[key].length) {
        for (let i = 0; i < inLight[key].length; i += 1) {
            inLight[key][i].onChange = function() {
                light[key][i] = inLight[key][i].get();
            }
        }
    } else {
        inLight[key].onChange = function() {
            light[key] = inLight[key].get();
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
        inShadowStrength.setUiAttribs({ greyout: false });
        inLRBT.setUiAttribs({ greyout: false });
        inNear.setUiAttribs({ greyout: false });
        inFar.setUiAttribs({ greyout: false });
        inBlur.setUiAttribs({ greyout: false });
        inBias.setUiAttribs({ greyout: false });
        inNormalOffset.setUiAttribs({ greyout: false });
        inPolygonOffset.setUiAttribs({ greyout: false });
    } else {
        inMapSize.setUiAttribs({ greyout: true });
        inShadowStrength.setUiAttribs({ greyout: true });
        inLRBT.setUiAttribs({ greyout: true });
        inNear.setUiAttribs({ greyout: true });
        inFar.setUiAttribs({ greyout: true });
        inBlur.setUiAttribs({ greyout: true });
        inBias.setUiAttribs({ greyout: true });
        inNormalOffset.setUiAttribs({ greyout: true });
        inPolygonOffset.setUiAttribs({ greyout: true });
        outTexture.set(null);
    }
}

const lightProjectionMatrix = mat4.create();
mat4.ortho(lightProjectionMatrix,
    -1*inLRBT.get(),
    inLRBT.get(),
    -1*inLRBT.get(),
    inLRBT.get(),
    inNear.get(),
    inFar.get()
);

inLRBT.onChange = inNear.onChange = inFar.onChange = function() {
    mat4.ortho(lightProjectionMatrix,
        -1*inLRBT.get(),
        inLRBT.get(),
        -1*inLRBT.get(),
        inLRBT.get(),
        inNear.get(),
        inFar.get());
}

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
    cgl.pushShader(blurShader);

    effect.setSourceTexture(fb.getTextureColor()); // take shadow map as source

    effect.startEffect();
    effect.bind();

    uniformXY.setValue([0, (inBlur.get() * 1.5) * texelSize]);
    cgl.setTexture(0, effect.getCurrentSourceTexture().tex);

    effect.finish();

    effect.bind();


    uniformXY.setValue([(inBlur.get() * 1.5) * texelSize, 0]);
    cgl.setTexture(0, effect.getCurrentSourceTexture().tex);


    effect.finish();

    effect.endEffect();

    cgl.popShader();
}

shader.offScreenPass = true;
blurShader.offScreenPass = true;

function renderShadowMap() {
    // * set shader
    cgl.gl.clearColor(0, 0, 0, 1);

    cgl.pushShader(shader);


    cgl.pushModelMatrix();
    cgl.pushViewMatrix();
    cgl.pushPMatrix();

    fb.renderStart(cgl);

    // * calculate matrices & camPos vector
    vec3.set(camPos, light.position[0], light.position[1], light.position[2]);
    mat4.copy(cgl.mMatrix, identityMat); // M
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


    cgl.popShader();

}

function renderHelpers() {
        if(op.patch.isEditorMode() && (CABLES.UI.renderHelper || gui.patch().isCurrentOp(op))) {
        CABLES.GL_MARKER.drawLineSourceDest({
            op: op,
            sourceX: -200*light.position[0],
            sourceY: -200*light.position[1],
            sourceZ: -200*light.position[2],
            destX: 200*light.position[0],
            destY: 200*light.position[1],
            destZ: 200*light.position[2],
        })
    }
}

inTrigger.onTriggered = function() {
    if (!cgl.frameStore.lightStack) cgl.frameStore.lightStack = [];
     // NOTE: how to handle this? fucks up the shadow map
     // renderHelpers();



    cgl.frameStore.lightStack.push(light);

    if (inCastShadow.get()) {
        if (!cgl.shadowPass) {
            if (fb) {
                cgl.shadowPass = true;
                cgl.frameStore.renderOffscreen = true;


                cgl.pushBlend(false);

                cgl.pushCullFace(true);
                cgl.pushCullFaceFacing(cgl.gl.FRONT);

                cgl.gl.enable(cgl.gl.POLYGON_OFFSET_FILL);
                cgl.gl.polygonOffset(inPolygonOffset.get(),inPolygonOffset.get());


                cgl.gl.colorMask(true,true,false,false);
                renderShadowMap();

                cgl.popBlend();
                cgl.popCullFaceFacing();
                cgl.popCullFace();

                cgl.gl.disable(cgl.gl.POLYGON_OFFSET_FILL);

                if (inBlur.get() > 0 && !IS_WEBGL_1) renderBlur();

                cgl.gl.colorMask(true,true,true,true);

                cgl.frameStore.renderOffscreen = false;
                cgl.shadowPass = false;

                outTexture.set(null);
                outTexture.set(fb.getTextureDepth());


                // remove light from stack and readd it with shadow map & mvp matrix
                cgl.frameStore.lightStack.pop();

                light.lightMatrix = lightBiasMVPMatrix;
                light.shadowBias = inBias.get();
                light.shadowMap = fb.getTextureColor();
                light.shadowMapDepth = fb.getTextureDepth();
                light.normalOffset = inNormalOffset.get();
                light.shadowStrength = inShadowStrength.get();
                cgl.frameStore.lightStack.push(light);

            }
        }
    }

    outTrigger.trigger();

    cgl.frameStore.lightStack.pop();
}
