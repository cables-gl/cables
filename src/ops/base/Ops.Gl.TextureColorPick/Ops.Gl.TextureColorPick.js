const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    inCoordFormat = op.inSwitch("Coordinates", ["Pixel", "0-1"], "Pixel"),
    inX = op.inInt("X", 0),
    inY = op.inInt("Y", 0),
    tex = op.inTexture("texture"),
    inAct = op.inBool("Active", true),
    outTrigger = op.outTrigger("trigger"),
    outR = op.outNumber("Red"),
    outG = op.outNumber("Green"),
    outB = op.outNumber("Blue"),
    outA = op.outNumber("Alpha");

let
    pbo = null,
    fb = null,
    pixelData = null,
    wasTriggered = true,
    texChanged = false;

let finishedFence = true;
tex.onChange = function () { texChanged = true; };

let isFloatingPoint = false;
let channelType = op.patch.cgl.gl.UNSIGNED_BYTE;
let pixelReader = new CGL.PixelReader();

op.toWorkPortsNeedToBeLinked(tex, pUpdate);

pUpdate.onTriggered = function ()
{
    if (!inAct.get()) return;
    const realTexture = tex.get();
    const gl = cgl.gl;

    if (!realTexture) return;
    if (!fb) fb = gl.createFramebuffer();

    isFloatingPoint = realTexture.isFloatingPoint();

    if (isFloatingPoint) channelType = gl.FLOAT;
    else channelType = gl.UNSIGNED_BYTE;

    const size = 4 * 4;
    if (!pixelData)
        if (isFloatingPoint) pixelData = new Float32Array(size);
        else pixelData = new Uint8Array(size);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, realTexture.tex, 0);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    let x = inX.get();
    let y = inY.get();

    if (inCoordFormat.get() == "0-1")
    {
        x = Math.min(realTexture.width, realTexture.width * x);
        y = Math.min(realTexture.height, realTexture.height * y);
    }

    pixelReader.read(cgl, fb, realTexture.pixelFormat, x, y, 1, 1, (pixel) =>
    {
        wasTriggered = false;
        texChanged = false;

        if (isFloatingPoint)
        {
            outR.set(pixel[0]);
            outG.set(pixel[1]);
            outB.set(pixel[2]);
            outA.set(pixel[3]);
        }
        else
        {
            outR.set(pixel[0] / 255);
            outG.set(pixel[1] / 255);
            outB.set(pixel[2] / 255);
            outA.set(pixel[3] / 255);
        }
    });

    outTrigger.trigger();
};
