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
     return this;
}


// * FRAMEBUFFER *
var fb = null;
if(cgl.glVersion==1) fb = new CGL.Framebuffer(cgl, 1024, 1024);
else {
    fb = new CGL.Framebuffer2(cgl,1024,1024, {
        // multisampling: true,
        isFloatingPointTexture:true,
        // multisampling:true,
        //filter: CGL.Texture.FILTER_NEAREST
         filter: CGL.Texture.FILTER_LINEAR,
         //shadowMap:true
    });
}
// * SHADER *
const shader = new CGL.Shader(cgl, "shadowSpotLight");
shader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
shader.setSource(attachments.spotlight_shadowpass_vert, attachments.spotlight_shadowpass_frag);
op.log( shader );
// cgl.shaderToRender = shader;

const blurShader = new CGL.Shader(cgl, "shadowSpotBlur");
blurShader.setSource(attachments.spotlight_blur_vert, attachments.spotlight_blur_frag);

const effect = new CGL.TextureEffect(cgl, { isFloatingPointTexture: true });

const outputTexture =new CGL.Texture(cgl, {
        name: "shadowSpotLightBlur",
        isFloatingPointTexture: true,
        filter: CGL.Texture.FILTER_LINEAR,
        width: 1024,
        height: 1024,
    });

const texelSize = 1/1024;
const uniformTexture = new CGL.Uniform(blurShader,'t','shadowMap', 0);
const uniformTexelSize = new CGL.Uniform(blurShader, 'f', 'texelSize', texelSize); // change with dropdown?
const uniformXY = new CGL.Uniform(blurShader, "2f", "inXY", null);


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
const inNear = op.inFloat("Near", 0.1);
const inFar = op.inFloat("Far", 30);
const inBlur = op.inFloatSlider("Blur Amount", 1);

op.setPortGroup("Shadow",[inCastShadow, inNear, inFar, inBlur]);

inNear.setUiAttribs({ greyout: true });
inFar.setUiAttribs({ greyout: true });
inBlur.setUiAttribs({ greyout: true });


const outTrigger = op.outTrigger("Trigger Out");
const outTexture = op.outTexture("Shadow Map");

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
            if (key === "coneAngle" || key === "coneAngleInner" || key === "coneAngleOuter") {
                light[key] = CGL.DEG2RAD*inLight[key].get();
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

inCastShadow.onChange = function() {
    const castShadow = inCastShadow.get();
    light.castShadow = castShadow;
    if (castShadow) {
        inNear.setUiAttribs({ greyout: false });
        inFar.setUiAttribs({ greyout: false });
        inBlur.setUiAttribs({ greyout: false });
    } else {
        inNear.setUiAttribs({ greyout: true });
        inFar.setUiAttribs({ greyout: true });
        inBlur.setUiAttribs({ greyout: true });
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
        2 * CGL.DEG2RAD * inLight.cosConeAngle.get(),
        1,
        inNear.get(),
        inFar.get()
    );
}

inNear.onChange = inFar.onChange = function() {updateProjectionMatrix(); }

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


    //outTexture.set(null);
    //outTexture.set(effect.getCurrentSourceTexture());
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

    fb.renderStart();
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

    outTrigger.trigger();

    fb.renderEnd();

    // remove light from stack and readd it with shadow map & mvp matrix
    cgl.lightStack.pop();

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();

    cgl.setPreviousShader();
}




const position = vec3.create();
const pointAtPos = vec3.create();
const resultPos = vec3.create();
const resultPointAt = vec3.create();

inTrigger.onTriggered = function() {
    if (!cgl.lightStack) cgl.lightStack = [];
    if (!cgl.frameStore.mapStack) cgl.frameStore.mapStack = [];

    vec3.set(position, inPosX.get(), inPosY.get(), inPosZ.get());
    vec3.set(pointAtPos, inPointAtX.get(), inPointAtY.get(), inPointAtZ.get());

    vec3.transformMat4(resultPos, position, cgl.mMatrix);
    vec3.transformMat4(resultPointAt, pointAtPos, cgl.mMatrix);

    light.position = resultPos;
    light.conePointAt = resultPointAt;

    /*
    if(op.patch.isEditorMode() && (CABLES.UI.renderHelper || gui.patch().isCurrentOp(op))) {
        gui.setTransformGizmo({
            posX:inPosX,
            posY:inPosY,
            posZ:inPosZ,
        });
        CABLES.GL_MARKER.drawLineSourceDest({
            op: op,
            sourceX: light.position[0],
            sourceY: light.position[1],
            sourceZ: light.position[2],
            destX: light.conePointAt[0],
            destY: light.conePointAt[1],
            destZ: light.conePointAt[2],
        })
    }
    */
    cgl.lightStack.push(light);

    if (inCastShadow.get()) {
        cgl.gl.enable(cgl.gl.CULL_FACE);
        cgl.gl.cullFace(cgl.gl.FRONT);

        cgl.frameStore.renderOffscreen = true;
        cgl.shadowPass = true;

        renderShadowMap();

        cgl.gl.cullFace(cgl.gl.BACK);
        cgl.gl.disable(cgl.gl.CULL_FACE);

        renderBlur();

        cgl.shadowPass = false;
        cgl.frameStore.renderOffscreen = false;
        //cgl.gl.disable(cgl.gl.CULL_FACE);
        // cgl.gl.colorMask(false,false,false,false);
        outTexture.set(null);
        outTexture.set(effect.getCurrentSourceTexture());

        light.lightMatrix = lightBiasMVPMatrix;
        cgl.frameStore.lightMatrix = lightBiasMVPMatrix;
        // light.shadowMap = blurredMap;
        cgl.frameStore.shadowMap = effect.getCurrentSourceTexture();

        cgl.lightStack.push(light);
        cgl.frameStore.mapStack.push(effect.getCurrentSourceTexture());
    }

    outTrigger.trigger();

    cgl.lightStack.pop();
    if (inCastShadow.get()) cgl.frameStore.mapStack.pop();
}


inTrigger.onLinkChanged = function() {
    if (!inTrigger.isLinked()) {
        cgl.frameStore.shadowMap = null;
    }
}
outTrigger.onLinkChanged = function() {
    if (!outTrigger.isLinked()) {
        cgl.frameStore.shadowMap = null;
    }
}
