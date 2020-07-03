const cgl = op.patch.cgl;
const gl = cgl.gl;
const mesh = CGL.MESHES.getSimpleRect(cgl, "fullscreenRectangle");

function Light(config)
{
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

inR.setUiAttribs({ "colorPick": true });
const colorIn = [inR, inG, inB];
op.setPortGroup("Color", colorIn);

const inSpecularR = op.inFloat("Specular R", 1);
const inSpecularG = op.inFloat("Specular G", 1);
const inSpecularB = op.inFloat("Specular B", 1);

inSpecularR.setUiAttribs({ "colorPick": true });
const colorSpecularIn = [inSpecularR, inSpecularG, inSpecularB];
op.setPortGroup("Specular Color", colorSpecularIn);

const inFalloff = op.inFloatSlider("Falloff", 0.5);

const attribIns = [inIntensity, inRadius];
op.setPortGroup("Light Attributes", attribIns);

const inCastShadow = op.inBool("Cast Shadow", false);
const inMapSize = op.inSwitch("Map Size", [256, 512, 1024, 2048], 512);
const inShadowStrength = op.inFloatSlider("Shadow Strength", 1);
const inNear = op.inFloat("Near", 0.1);
const inFar = op.inFloat("Far", 30);
const inBias = op.inFloatSlider("Bias", 0.004);
const inPolygonOffset = op.inInt("Polygon Offset", 1);
op.setPortGroup("", [inCastShadow]);
op.setPortGroup("Shadow Map Settings", [inMapSize, inShadowStrength, inNear, inFar, inBias, inPolygonOffset]);
const shadowProperties = [inNear, inFar];
inMapSize.setUiAttribs({ "greyout": true });
inShadowStrength.setUiAttribs({ "greyout": true });
inNear.setUiAttribs({ "greyout": true });
inFar.setUiAttribs({ "greyout": true });
inPolygonOffset.setUiAttribs({ "greyout": true });

let updating = false;

inCastShadow.onChange = function ()
{
    updating = true;
    const castShadow = inCastShadow.get();
    if (castShadow)
    {
        const size = inMapSize.get();
        newLight.createFramebuffer(size, size, {});
        newLight.createShadowMapShader();
    }


    inMapSize.setUiAttribs({ "greyout": !castShadow });
    inShadowStrength.setUiAttribs({ "greyout": !castShadow });
    inNear.setUiAttribs({ "greyout": !castShadow });
    inFar.setUiAttribs({ "greyout": !castShadow });
    inBias.setUiAttribs({ "greyout": !castShadow });
    inPolygonOffset.setUiAttribs({ "greyout": !castShadow });
    updateLight = true;
    updating = false;
};

const outTrigger = op.outTrigger("Trigger Out");
const outCubemap = op.outObject("Cubemap");
const outProjection = op.outTexture("Cubemap Projection");
const inLight = {
    "position": [inPosX, inPosY, inPosZ],
    "color": [inR, inG, inB],
    "specular": [inSpecularR, inSpecularG, inSpecularB],
    "intensity": inIntensity,
    "radius": inRadius,
    "falloff": inFalloff,
};

const newLight = new CGL.Light(cgl, {
    "type": "point",
    "position": [0, 1, 2].map(function (i) { return positionIn[i].get(); }),
    "color": [0, 1, 2].map(function (i) { return colorIn[i].get(); }),
    "specular": [0, 1, 2].map(function (i) { return colorSpecularIn[i].get(); }),
    "intensity": inIntensity.get(),
    "radius": inRadius.get(),
    "falloff": inFalloff.get(),
});

let updateLight = false;

inPosX.onChange = inPosY.onChange = inPosZ.onChange = inR.onChange = inG.onChange = inB.onChange
= inSpecularR.onChange = inSpecularG.onChange = inSpecularB.onChange = inIntensity.onChange
= inRadius.onChange = inFalloff.onChange = inNear.onChange = inFar.onChange = function ()
        {
            updateLight = true;
        };

inMapSize.onChange = function ()
{
    // TODO: update this one

    const size = Number(inMapSize.get());
    newLight.createFramebuffer(size, size, {});
    newLight.createShadowMapShader();
};

let projectionShader = null;
let cubeMapEffect = null;
let uniformCubemap = null;

// * FRAMEBUFFER *
let fb = null;
const IS_WEBGL_1 = cgl.glVersion == 1;

if (IS_WEBGL_1)
{
    fb = new CGL.Framebuffer(cgl, 512, 512, {
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_LINEAR,
        "wrap": CGL.Texture.WRAP_REPEAT
    });
}
else
{
    fb = new CGL.Framebuffer2(cgl, 512, 512, {
        "isFloatingPointTexture": true,
        "filter": CGL.Texture.FILTER_LINEAR,
        "wrap": CGL.Texture.WRAP_REPEAT,
    });
}

cubeMapEffect = new CGL.TextureEffect(cgl, { "isFloatingPointTexture": true });
projectionShader = new CGL.Shader(cgl, "cubemapProjection");
uniformCubemap = new CGL.Uniform(projectionShader, "t", "cubeMap", 1);

projectionShader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);
projectionShader.setSource(attachments.cubemapprojection_vert, attachments.cubemapprojection_frag);


function renderCubemapProjection(cubemap, framebuffer)
{
    if (!cubemap) return;
    cgl.frameStore.renderOffscreen = true;

    fb.renderStart(cgl);
    projectionShader.pushTexture(uniformCubemap, cubemap, cgl.gl.TEXTURE_CUBE_MAP);
    mesh.render(projectionShader);
    fb.renderEnd();
    projectionShader.popTextures();
    /* cubeMapEffect.setSourceTexture(framebuffer.getTextureColor()); // take shadow map as source

    cubeMapEffect.startEffect();
    cgl.pushShader(projectionShader);

    cubeMapEffect.bind();

    cgl.setTexture(0, cubemap, cgl.gl.TEXTURE_CUBE_MAP);

    cgl.setTexture(0, cubeMapEffect.getCurrentSourceTexture().tex);

    cubeMapEffect.finish();

    cubeMapEffect.endEffect(); */

    cgl.frameStore.renderOffscreen = false;

    outProjection.set(null);
    outProjection.set(fb.getTextureColor());
    outCubemap.set(null);
    outCubemap.set(newLight.shadowCubeMap);
}


projectionShader.offScreenPass = true;


const sc = vec3.create();
const result = vec3.create();
const position = vec3.create();
const transVec = vec3.create();

function drawHelpers()
{
    if (cgl.frameStore.shadowPass) return;
    if (op.isCurrentUiOp())
    {
        gui.setTransformGizmo({
            "posX": inPosX,
            "posY": inPosY,
            "posZ": inPosZ,
        });

        cgl.pushModelMatrix();
        mat4.translate(cgl.mMatrix, cgl.mMatrix, transVec);
        CABLES.GL_MARKER.drawSphere(op, inRadius.get());
        cgl.popModelMatrix();
    }
}

inTrigger.onTriggered = function ()
{
    if (updating) return;
    if (updateLight)
    {
        newLight.position = [0, 1, 2].map(function (i) { return positionIn[i].get(); });
        newLight.color = [0, 1, 2].map(function (i) { return colorIn[i].get(); });
        newLight.specular = [0, 1, 2].map(function (i) { return colorSpecularIn[i].get(); });
        newLight.intensity = inIntensity.get();
        newLight.radius = inRadius.get();
        newLight.falloff = inFalloff.get();
        newLight.castShadow = inCastShadow.get();
        newLight.updateProjectionMatrix(null, inNear.get(), inFar.get(), null);
        updateLight = false;
    }

    if (!cgl.frameStore.lightStack) cgl.frameStore.lightStack = [];

    vec3.set(transVec, inPosX.get(), inPosY.get(), inPosZ.get());
    vec3.transformMat4(position, transVec, cgl.mMatrix);
    newLight.position = position;

    drawHelpers();

    cgl.frameStore.lightStack.push(newLight);

    if (inCastShadow.get())
    {
        newLight.renderPasses(inPolygonOffset.get(), null, function () { outTrigger.trigger(); });

        // TODO: add projection code
        if (!cgl.frameStore.shadowPass)
        {
            cgl.frameStore.lightStack.pop();
            newLight.castShadow = inCastShadow.get();
            newLight.shadowBias = inBias.get();
            newLight.shadowStrength = inShadowStrength.get();
            if (newLight.shadowCubeMap.cubemap) renderCubemapProjection(newLight.shadowCubeMap.cubemap, newLight._framebuffer);
            cgl.frameStore.lightStack.push(newLight);
        }
    }

    outTrigger.trigger();
    cgl.frameStore.lightStack.pop();
};
