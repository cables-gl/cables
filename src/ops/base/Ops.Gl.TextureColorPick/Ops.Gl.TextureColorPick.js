const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    // inNormalize = op.inSwitch("Coordinate", ["Pixel", "Normalized"], "Pixel"),
    inX = op.inInt("X", 0),
    inY = op.inInt("Y", 0),
    tex = op.inTexture("texture"),
    outTrigger = op.outTrigger("trigger"),
    outR = op.outNumber("Red"),
    outG = op.outNumber("Green"),
    outB = op.outNumber("Blue"),
    outA = op.outNumber("Alpha");

let
    fb = null,
    pixelData = null,
    wasTriggered = true,
    texChanged = false;

tex.onChange = function () { texChanged = true; };

let isFloatingPoint = false;
let channelType = op.patch.cgl.gl.UNSIGNED_BYTE;

op.patch.cgl.on("endframe", () =>
{
    if (!wasTriggered) return;
    wasTriggered = false;
    const gl = cgl.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.readPixels(
        inX.get(), inY.get(),
        1, 1,
        gl.RGBA,
        channelType,
        pixelData
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
});

pUpdate.onTriggered = function ()
{
    wasTriggered = true;
    const realTexture = tex.get(), gl = cgl.gl;

    if (!realTexture) return;
    if (!fb) fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    if (texChanged)
    {
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, realTexture.tex, 0
        );

        isFloatingPoint = realTexture.textureType == CGL.Texture.TYPE_FLOAT;

        if (isFloatingPoint) channelType = gl.FLOAT;
        else channelType = gl.UNSIGNED_BYTE;

        const size = 4 * 4;
        if (isFloatingPoint) pixelData = new Float32Array(size);
        else pixelData = new Uint8Array(size);

        texChanged = false;
    }

    // gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    // gl.readPixels(
    //     inX.get(), inY.get(),
    //     1, 1,
    //     gl.RGBA,
    //     channelType,
    //     pixelData
    // );

    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (isFloatingPoint)
    {
        outR.set(pixelData[0]);
        outG.set(pixelData[1]);
        outB.set(pixelData[2]);
        outA.set(pixelData[3]);
    }
    else
    {
        outR.set(pixelData[0] / 255);
        outG.set(pixelData[1] / 255);
        outB.set(pixelData[2] / 255);
        outA.set(pixelData[3] / 255);
    }

    outTrigger.trigger();
};
