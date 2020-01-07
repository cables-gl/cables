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
const shader = new CGL.Shader(cgl, "shadowDirLight");
shader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
shader.setSource(attachments.dirlight_shadowpass_vert, attachments.dirlight_shadowpass_frag);

// cgl.shaderToRender = shader;

const blurShader = new CGL.Shader(cgl, "shadowBlur");
blurShader.setSource(attachments.dirlight_blur_vert, attachments.dirlight_blur_frag);

const effect = new CGL.TextureEffect(cgl, { isFloatingPointTexture: true });

const outputTexture =new CGL.Texture(cgl, {
        name: "shadowDirLightBlur",
        isFloatingPointTexture: true,
        filter: CGL.Texture.FILTER_MIPMAP,
        width: 1024,
        height: 1024,
    });

const texelSize = 1/1024;
const uniformTexture = new CGL.Uniform(blurShader,'t','shadowMap', 0);
const uniformTexelSize = new CGL.Uniform(blurShader, 'f', 'texelSize', texelSize); // change with dropdown?
const uniformXY = new CGL.Uniform(blurShader, "2f", "inXY", null);



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

const inLRBT = op.inFloat("LR-BottomTop", 8);
const inNear = op.inFloat("Near", 0.1);
const inFar = op.inFloat("Far", 30);
const inBlur = op.inFloatSlider("Blur Amount", 1);

const outTrigger = op.outTrigger("Trigger Out");
const outTexture = op.outTexture("Shadow Map");

const light = new Light({
    type: "directional",
    position: [0, 1, 2].map(function(i){ return positionIn[i].get() }),
    color: [0 , 1, 2].map(function(i) { return colorIn[i].get() }),
    specular: [0 , 1, 2].map(function(i) { return colorSpecularIn[i].get() }),
    intensity: inIntensity.get(),
    radius: null,
    falloff: null,
});


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

function renderBlur(texture) {
    //effect.setSourceTexture(texture);

    cgl.setShader(blurShader);

    effect.setSourceTexture(fb.getTextureColor()); // take shadow map as source
    // op.log(fb.getTextureColor());
    effect.startEffect();

    effect.bind();

    uniformXY.setValue([0, (inBlur.get() * 1.5) * texelSize]);
    cgl.setTexture(0, effect.getCurrentSourceTexture().tex);

    effect.finish();

    effect.bind();


    uniformXY.setValue([(inBlur.get() * 1.5) * texelSize, 0]);
    cgl.setTexture(0, effect.getCurrentSourceTexture().tex);


    effect.finish();


    //outTexture.set(null);
    //outTexture.set(effect.getCurrentSourceTexture());
    effect.endEffect();

    cgl.setPreviousShader();
}

function renderShadowMap() {
    // * set shader
    cgl.gl.clearColor(0, 0, 0, 1);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);

    cgl.setShader(shader);

    cgl.pushModelMatrix();
    cgl.pushViewMatrix();
    cgl.pushPMatrix();

    fb.renderStart();
    /* */
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

    fb.renderEnd();

    // remove light from stack and readd it with shadow map & mvp matrix
    cgl.lightStack.pop();

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();

    cgl.setPreviousShader();
}

inTrigger.onTriggered = function() {
    if (!cgl.lightStack) cgl.lightStack = [];
    if (!cgl.frameStore.mapStack) cgl.frameStore.mapStack = [];

    /*
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

    */
    cgl.lightStack.push(light);

    //cgl.gl.enable(cgl.gl.CULL_FACE);
    //cgl.gl.cullFace(cgl.gl.FRONT);
    //cgl.gl.colorMask(false,false,false,false);
    cgl.shadowPass = true;
    //cgl.gl.enable(cgl.gl.POLYGON_OFFSET_FILL);
    //cgl.gl.polygonOffset(0, 0);

    cgl.gl.enable(cgl.gl.CULL_FACE);
    cgl.gl.cullFace(cgl.gl.FRONT);

    renderShadowMap();

    //cgl.gl.disable(cgl.gl.POLYGON_OFFSET_FILL);
    cgl.gl.cullFace(cgl.gl.BACK);
    cgl.gl.disable(cgl.gl.CULL_FACE);


    renderBlur();

    cgl.shadowPass = false;

    // op.log(blurredMap);
    //cgl.gl.disable(cgl.gl.CULL_FACE);
    // cgl.gl.colorMask(false,false,false,false);
    outTexture.set(null);
    outTexture.set(fb.getTextureColor());

    light.lightMatrix = lightBiasMVPMatrix;
    cgl.frameStore.lightMatrix = lightBiasMVPMatrix;
    // light.shadowMap = blurredMap;
    cgl.frameStore.shadowMap = fb.getTextureColor(); // effect.getCurrentSourceTexture();
    cgl.lightStack.push(light);

    cgl.frameStore.mapStack.push(fb.getTextureColor());

    //cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);

    outTrigger.trigger();
    cgl.lightStack.pop();
    cgl.frameStore.mapStack.pop();
}

op.onDelete = function () { cgl.frameStore.shadowMap = null; }
inTrigger.onLinkChanged = function() {
    if (!inTrigger.isLinked()) {
        cgl.frameStore.shadowMap = null;
        op.log("removing inTrigger", cgl.frameStore.shadowMap);
    }
}
outTrigger.onLinkChanged = function() {
    if (!outTrigger.isLinked()) {
        cgl.frameStore.shadowMap = null;
        op.log("removing shadowmap", cgl.frameStore.shadowMap);
    }
}