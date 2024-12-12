let render = op.inTrigger("Render");
let strength = op.inValueSlider("Strength", 0.5);

let areaSize = op.inValueInt("Area Size", 20);
let mapSize = op.inValueInt("Map Size", 512);
let samples = op.inValueInt("Samples", 4);

let polyOff = op.inValueInt("Poly Offset", 0);

let bias = op.inValueInt("Bias", 0.0);
let znear = op.inValueInt("Z Near", 0.1);
let zfar = op.inValueInt("Z Far", 300);
let lookat = op.inArray("Look at");

let showMapArea = op.inValueBool("Show Map Area", false);
let next = op.outTrigger("Next");

let cgl = op.patch.cgl;
let lightMVP = mat4.create();
let fb = null;
mapSize.onChange = setSize;

function setSize()
{
    fb.setSize(mapSize.get(), mapSize.get());
}

if (cgl.glVersion == 1) fb = new CGL.Framebuffer(cgl, 32, 32);
else
{
    console.log("new framebuffer...");
    fb = new CGL.Framebuffer2(cgl, 32, 32, {
        "multisampling": true,
        "isFloatingPointTexture": true,
        "shadowMap": true

    });
}
setSize();

let tex = op.outTexture("shadow texture");
tex.set(fb.getTextureDepth());

function renderPickingPass()
{
    fb.renderStart();

    cgl.pushModelMatrix();
    cgl.pushViewMatrix();
    // cgl.resetViewPort();

    cgl.pushPMatrix();

    if (!lookat.get())
    {
        vec3.set(vUp, 0, 1, 0);
        vec3.set(vEye, 1, 50, 0);
        vec3.set(vCenter, 0, 0, 0);
    }
    else
    {
        let la = lookat.get();

        vec3.set(vEye, la[0], la[1], la[2]);
        vec3.set(vCenter, la[3], la[4], la[5] + 0.00001);
        vec3.set(vUp, la[6], la[7], la[8]);
    }

    let size = areaSize.get();
    // mat4.perspective(cgl.pMatrix,45, 1, 0.1, 100.0);
    mat4.ortho(cgl.pMatrix,
        1 * size,
        -1 * size,
        1 * size,
        -1 * size,
        znear.get(),
        zfar.get()
    );

    mat4.lookAt(cgl.vMatrix, vEye, vCenter, vUp);

    // =lightViewMatrix;

    // mat4.mul(lightMVP,lightViewMatrix,cgl.pMatrix);
    mat4.mul(lightMVP, cgl.pMatrix, cgl.vMatrix);

    let biasMatrix = mat4.fromValues(
        0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, 0.0, 0.5, 0.5, 0.5, 1.0);
    mat4.mul(lightMVP, biasMatrix, lightMVP);
    // mat4.mul(lightMVP,lightMVP,biasMatrix);

    cgl.tempData.lightMVP = lightMVP;
    // console.log(cgl.tempData.lightMVP);

    // mat4.mul(cgl.pMatrix);

    // g_mvpMatrix.set(viewProjMatrix);cu
    // g_mvpMatrix.multiply(g_modelMatrix);

    cgl.gl.clear(cgl.gl.DEPTH_BUFFER_BIT | cgl.gl.COLOR_BUFFER_BIT);
    next.trigger();

    cgl.popPMatrix();

    cgl.popModelMatrix();
    cgl.popViewMatrix();

    fb.renderEnd();
}

var vUp = vec3.create();
var vEye = vec3.create();
var vCenter = vec3.create();
let lightViewMatrix = mat4.create();

let shadowObj = {};

let doRender = function ()
{
    if (cgl.glVersion == 2)
    {
        let minimizeFB = 8;

        cgl.gl.enable(cgl.gl.CULL_FACE);
        cgl.gl.cullFace(cgl.gl.FRONT);

        cgl.gl.enable(cgl.gl.POLYGON_OFFSET_FILL);
        cgl.gl.polygonOffset(polyOff.get(), polyOff.get());

        cgl.gl.colorMask(false, false, false, false);
        cgl.tempData.shadowPass = true;
        renderPickingPass();
        cgl.gl.colorMask(true, true, true, true);

        cgl.gl.disable(cgl.gl.POLYGON_OFFSET_FILL);

        shadowObj.mapsize = mapSize.get();
        shadowObj.showMapArea = showMapArea.get();
        shadowObj.strength = strength.get();
        shadowObj.samples = Math.max(1, samples.get());
        shadowObj.bias = bias.get();
        shadowObj.shadowMap = fb.getTextureDepth();
        cgl.tempData.shadow = shadowObj;

        cgl.gl.cullFace(cgl.gl.BACK);
        cgl.tempData.shadowPass = false;

        next.trigger();
        cgl.tempData.shadow = null;

        cgl.gl.disable(cgl.gl.CULL_FACE);
    }
    else
    {
        next.trigger();
    }
};

render.onTriggered = doRender;
