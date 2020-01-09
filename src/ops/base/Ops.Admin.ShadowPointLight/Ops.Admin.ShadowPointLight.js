const cgl = op.patch.cgl;
const gl = cgl.gl;

function Light(config) {
     this.type = config.type || "point";
     this.color = config.color || [1, 1, 1];
     this.specular = config.specular || [0, 0, 0];
     this.position = config.position || null;
     this.intensity = config.intensity || 1;
     this.radius = config.radius || 1;
     this.falloff = config.falloff || 1;
     this.spotExponent = config.spotExponent || 1;
     this.cosConeAngle = Math.cos(CGL.DEG2RAD * this.coneAngle);
     this.conePointAt = config.conePointAt || [0, 0, 0];
     this.castShadow = config.castShadow || false;
     return this;
}




// * OP START *
const inTrigger = op.inTrigger("Trigger In");
const inIntensity = op.inFloat("Intensity", 2);
const inRadius = op.inFloat("Radius", 15);

const inPosX = op.inFloat("X", 0);
const inPosY = op.inFloat("Y", 1);
const inPosZ = op.inFloat("Z", 0.75);

const positionIn = [inPosX, inPosY, inPosZ];
op.setPortGroup("Position", positionIn);

const inR = op.inFloat("R", 0.8);
const inG = op.inFloat("G", 0.8);
const inB = op.inFloat("B", 0.8);

inR.setUiAttribs({ colorPick: true });
const colorIn = [inR, inG, inB];
op.setPortGroup("Color", colorIn);

const inSpecularR = op.inFloat("Specular R", 1);
const inSpecularG = op.inFloat("Specular G", 1);
const inSpecularB = op.inFloat("Specular B", 1);

inSpecularR.setUiAttribs({ colorPick: true });
const colorSpecularIn = [inSpecularR, inSpecularG, inSpecularB];
op.setPortGroup("Specular Color", colorSpecularIn);


const inFalloff = op.inFloatSlider("Falloff", 0.5);

const attribIns = [inIntensity, inRadius];
op.setPortGroup("Light Attributes", attribIns);

const inCastShadow = op.inBool("Cast Shadow", false);
const inMapSize = op.inSwitch("Map Size",[256, 512, 1024, 2048], 512);
const inNear = op.inFloat("Near", 0.1);
const inFar = op.inFloat("Far", 30);
const inBlur = op.inFloatSlider("Blur Amount", 1);
op.setPortGroup("Shadow",[inCastShadow, inMapSize, inNear, inFar, inBlur]);
const shadowProperties = [inNear, inFar, inBlur];
inMapSize.setUiAttribs({ greyout: true });
inNear.setUiAttribs({ greyout: true });
inFar.setUiAttribs({ greyout: true });
inBlur.setUiAttribs({ greyout: true });

inCastShadow.onChange = function() {
    const castShadow = inCastShadow.get();
    light.castShadow = castShadow;
    if (castShadow) {
        inMapSize.setUiAttribs({ greyout: false });
        inNear.setUiAttribs({ greyout: false });
        inFar.setUiAttribs({ greyout: false });
        inBlur.setUiAttribs({ greyout: false });
    } else {
        inMapSize.setUiAttribs({ greyout: true });
        inNear.setUiAttribs({ greyout: true });
        inFar.setUiAttribs({ greyout: true });
        inBlur.setUiAttribs({ greyout: true });
    }
}

// * SHADER *
const shader = new CGL.Shader(cgl, "shadowPointLight");
shader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
shader.setSource(attachments.pointlight_shadowpass_vert, attachments.pointlight_shadowpass_frag);
const uniformLightPos = new CGL.Uniform(shader, '3f', 'lightPosition', vec3.create());
const uniformNearFar = new CGL.Uniform(shader, '2f', 'inNearFar', vec2.create());

const lightProjectionMatrix = mat4.create();

mat4.perspective(
    lightProjectionMatrix,
    CGL.DEG2RAD*90,
    1,
    inNear.get(),
    inFar.get()
);

inNear.onChange = inFar.onChange = function() {
        mat4.perspective(
        lightProjectionMatrix,
        CGL.DEG2RAD*90,
        1,
        inNear.get(),
        inFar.get()
    );
}

const outTrigger = op.outTrigger("Trigger Out");
const outCubemap = op.outObject("Cubemap");
const outProjection = op.outTexture("Cubemap Projection");
const inLight = {
  position: [inPosX, inPosY, inPosZ],
  color: [inR, inG, inB],
  specular: [inSpecularR, inSpecularG, inSpecularB],
  intensity: inIntensity,
  radius: inRadius,
  falloff: inFalloff,
};

// * FRAMEBUFFER *
var fb = null;
if(cgl.glVersion==1) fb = new CGL.Framebuffer(cgl, Number(inMapSize.get()), Number(inMapSize.get()));
else {
    fb = new CGL.Framebuffer2(cgl,Number(inMapSize.get()),Number(inMapSize.get()), {
        // multisampling: true,
        isFloatingPointTexture: true,
        // multisampling:true,
        //filter: CGL.Texture.FILTER_NEAREST
         filter: CGL.Texture.FILTER_LINEAR,
         //shadowMap:true
    });
}

const blurShader = new CGL.Shader(cgl, "shadowBlur");
blurShader.setSource(attachments.pointlight_blur_vert, attachments.pointlight_blur_frag);

const effect = new CGL.TextureEffect(cgl, { isFloatingPointTexture: true });

const outputTexture =new CGL.Texture(cgl, {
        name: "shadowDirLightBlur",
        isFloatingPointTexture: true,
        filter: CGL.Texture.FILTER_MIPMAP,
        width: Number(inMapSize.get()),
        height: Number(inMapSize.get()),
    });

var texelSize = 1/Number(inMapSize.get());
const uniformTexture = new CGL.Uniform(blurShader,'t','shadowMap', 0);
const uniformTexelSize = new CGL.Uniform(blurShader, 'f', 'texelSize', texelSize); // change with dropdown?
const uniformXY = new CGL.Uniform(blurShader, "2f", "inXY", null);

var cubemapInitialized = false;

const light = new Light({
    type: "point",
    position: [0, 1, 2].map(function(i){ return positionIn[i].get() }),
    color: [0 , 1, 2].map(function(i) { return colorIn[i].get() }),
    specular: [0 , 1, 2].map(function(i) { return colorSpecularIn[i].get() }),
    intensity: inIntensity.get(),
    radius: inRadius.get(),
    falloff: inFalloff.get(),
});

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
    cubemapInitialized = false;
    const size = Number(inMapSize.get());
    fb.setSize(size, size);
    texelSize = 1 / size;
    uniformTexelSize.setValue(texelSize);
    initializeCubemap();
    cubemapInitialized = true;
}

const CUBEMAP_PROPERTIES = [  // targets for use in some gl functions for working with cubemaps
    {
        face: gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        lookAt: vec3.fromValues(1.0, 0.0, 0.0),
        up: vec3.fromValues(0.0, -1.0, 0.0),
    }, {
        face: gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        lookAt: vec3.fromValues(-1.0, 0.0, 0.0),
        up: vec3.fromValues(0.0, -1.0, 0.0),
    }, {
        face: gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        lookAt: vec3.fromValues(0.0, 1.0, 0.0),
        up: vec3.fromValues(0.0, 0.0, 1.0),
    }, {
        lookAt: vec3.fromValues(0.0, -1.0, 0.0),
        up: vec3.fromValues(0.0, 0.0, -1.0),
        face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
    }, {
        face: gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        lookAt: vec3.fromValues(0.0, 0.0, 1.0),
        up: vec3.fromValues(0.0, -1.0, 0.0),
    }, {
        face: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
        lookAt: vec3.fromValues(0.0, 0.0, -1.0),
        up: vec3.fromValues(0.0, -1.0, 0.0),
    },
];

function checkError(when)
{
    var err=gl.getError();
    if (err != gl.NO_ERROR) {
        console.log("error "+when);
        console.log('error size',Number(inMapSize.get()));
        if(err==cgl.gl.NO_ERROR)console.error("NO_ERROR");
        if(err==cgl.gl.OUT_OF_MEMORY)console.error("OUT_OF_MEMORY");
        if(err==cgl.gl.INVALID_ENUM)console.error("INVALID_ENUM");
        if(err==cgl.gl.INVALID_OPERATION)console.error("INVALID_OPERATION");
        if(err==cgl.gl.INVALID_FRAMEBUFFER_OPERATION)console.error("INVALID_FRAMEBUFFER_OPERATION");
        if(err==cgl.gl.INVALID_VALUE)console.error("INVALID_VALUE");
        if(err==cgl.gl.CONTEXT_LOST_WEBGL)console.error("CONTEXT_LOST_WEBGL");

        // throw "Some WebGL error occurred while trying to create framebuffer.  Maybe you need more resources; try another browser or computer.";
    }

}
var framebuffer = null;
var depthBuffer = null;
const cubeMap = { cubemap: null, size: null };
var dynamicCubemap = null;


function initializeCubemap() {
    var i=0;

    checkError(221);

    dynamicCubemap = gl.createTexture(); // Create the texture object for the reflection map

    checkError(111);

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, dynamicCubemap);  // create storage for the reflection map images
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    checkError(122);

    for (i = 0; i < 6; i++)
    {
        gl.texImage2D(
            CUBEMAP_PROPERTIES[i].face,
            0,
            gl.RGBA,
            Number(inMapSize.get()),
            Number(inMapSize.get()),
            0, gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
            );
        //With null as the last parameter, the previous function allocates memory for the texture and fills it with zeros.
    }
    checkError(1);

    framebuffer = gl.createFramebuffer();  // crate the framebuffer that will draw to the reflection map

    checkError(2);

    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);  // select the framebuffer, so we can attach the depth buffer to it
    checkError(3);

    depthBuffer = gl.createRenderbuffer();   // renderbuffer for depth buffer in framebuffer
    checkError(4);
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer); // so we can create storage for the depthBuffer
    checkError(5);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, Number(inMapSize.get()), Number(inMapSize.get()));
    checkError(6);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
    checkError(7);
        // The same framebuffer will be used to draw all six faces of the cubemap.  Each side will be attached
        // as the color buffer of the framebuffer while that side is being drawn.

    // Check form WebGL errors (since I'm not sure all platforms will be able to create the framebuffer)

    outCubemap.set({ cubemap: dynamicCubemap });

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    cubemapInitialized = true;
     // cgl.resetViewPort();
}

const cubeMapEffect = new CGL.TextureEffect(cgl, { isFloatingPointTexture: true });
const projectionShader = new CGL.Shader(cgl, "cubemapProjection");
const uniformCubemap = new CGL.Uniform(projectionShader, 't', 'cubeMap', 1);

projectionShader.setModules(['MODULE_VERTEX_POSITION', 'MODULE_COLOR', 'MODULE_BEGIN_FRAG']);
projectionShader.setSource(projectionShader.getDefaultVertexShader(), attachments.cubemapprojection_frag);

function renderCubemapProjection() {
    if(!dynamicCubemap) return;


    cgl.setShader(projectionShader);

    cubeMapEffect.setSourceTexture(fb.getTextureColor()); // take shadow map as source

    cubeMapEffect.startEffect();

    cubeMapEffect.bind();

    cgl.setTexture(1, dynamicCubemap, cgl.gl.TEXTURE_CUBE_MAP);

    cgl.setTexture(0, cubeMapEffect.getCurrentSourceTexture().tex);

    cubeMapEffect.finish();

    cubeMapEffect.endEffect();
    cgl.setPreviousShader();
    outProjection.set(null);
    outProjection.set(cubeMapEffect.getCurrentSourceTexture());
}


shader.offScreenPass = true;
blurShader.offScreenPass = true;
projectionShader.offScreenPass = true;

const identityMat = mat4.create();
const lookAt = vec3.create();
function renderCubeSide(index) {

    cgl.pushModelMatrix();
    cgl.pushViewMatrix();
    cgl.pushPMatrix();

    gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        CUBEMAP_PROPERTIES[index].face,
        dynamicCubemap,
        0
    );

    gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        depthBuffer
    );

    gl.clearColor(1, 1, 1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // * calculate matrices & camPos vector
    mat4.copy(cgl.mMatrix, identityMat); // M

    vec3.add(lookAt, light.position, CUBEMAP_PROPERTIES[index].lookAt);

    mat4.lookAt(cgl.vMatrix, light.position, lookAt, CUBEMAP_PROPERTIES[index].up); // V
    mat4.copy(cgl.pMatrix, lightProjectionMatrix); // P

    // * create light mvp bias matrix
    /*
    mat4.mul(lightBiasMVPMatrix, cgl.pMatrix, cgl.vMatrix);
    mat4.mul(lightBiasMVPMatrix, cgl.mMatrix, lightBiasMVPMatrix);
    mat4.mul(lightBiasMVPMatrix, biasMatrix, lightBiasMVPMatrix);
    */
    outTrigger.trigger();

    // fb.renderEnd();

    // remove light from stack and readd it with shadow map & mvp matrix
    // cgl.lightStack.pop();

    cgl.popPMatrix();
    cgl.popModelMatrix();
    cgl.popViewMatrix();
}

function renderCubemap() {
    cgl.setShader(shader);
    uniformLightPos.setValue(light.position);
    uniformNearFar.setValue([inNear.get(), inFar.get()]);

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, dynamicCubemap);
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
    gl.viewport(0, 0, Number(inMapSize.get()), Number(inMapSize.get()));

    cgl.gl.enable(cgl.gl.CULL_FACE);
    cgl.gl.cullFace(cgl.gl.FRONT);

    for (let i = 0; i < 6; i += 1) renderCubeSide(i);

    cgl.gl.cullFace(cgl.gl.BACK);
    cgl.gl.disable(cgl.gl.CULL_FACE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    cgl.resetViewPort();
    cgl.setPreviousShader();
}

const sc=vec3.create();
const result = vec3.create();
const position = vec3.create();
const transVec = vec3.create();


initializeCubemap();

inTrigger.onTriggered = function() {

    if (!cgl.lightStack) cgl.lightStack = [];
    if (!cgl.frameStore.mapStack) cgl.frameStore.mapStack = [];
    vec3.set(transVec, inPosX.get(), inPosY.get(), inPosZ.get());
    vec3.transformMat4(position, transVec, cgl.mMatrix);
    light.position = position;

    // mat4.getScaling(sc,cgl.mMatrix);
    // light.radius=inRadius.get()*sc[0];

    if(CABLES.UI && gui.patch().isCurrentOp(op)) {
        gui.setTransformGizmo({
            posX: inPosX,
            posY: inPosY,
            posZ: inPosZ,
        });

        /*
        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix,cgl.mMatrix, transVec);
        CABLES.GL_MARKER.drawSphere(op, inRadius.get());
        cgl.popModelMatrix();
        */
    }

    cgl.lightStack.push(light);

    if (inCastShadow.get()) {
        if (!cubemapInitialized) initializeCubemap();
        cgl.frameStore.renderOffscreen = true;
        cgl.shadowPass = true;

        renderCubemap();
        renderCubemapProjection();

        cgl.shadowPass = false;
        cgl.frameStore.renderOffscreen = false;
        cgl.lightStack.pop();

        cgl.frameStore.shadowCubeMap = { cubemap: dynamicCubemap };
        cgl.frameStore.mapStack.push(dynamicCubemap);

        light.nearFar = [inNear.get(), inFar.get()];

        cgl.lightStack.push(light);
    }
    outTrigger.trigger();

    cgl.lightStack.pop();

    if (inCastShadow.get()) cgl.frameStore.mapStack.pop();
}

inTrigger.onLinkChanged = function() {
    if (!inTrigger.isLinked()) {
        cgl.frameStore.shadowCubeMap = null;
    }
}
outTrigger.onLinkChanged = function() {
    if (!outTrigger.isLinked()) {
        cgl.frameStore.shadowCubeMap = null;
    }
}

