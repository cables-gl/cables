const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    tex = op.inObject("texture"),
    inNormalize = op.inSwitch("Normalize", ["0-255", "0-1", "-1-1"], "0-255"),
    outTrigger = op.outTrigger("trigger"),
    outColors = op.outArray("Colors"),
    outIsFloatingPoint = op.outBoolNum("Floating Point");

let
    fb = null,
    pixelData = null,
    texChanged = false;
tex.onChange = function () { texChanged = true; };

op.toWorkPortsNeedToBeLinked(tex, outColors);

let isFloatingPoint = false;
let channelType = op.patch.cgl.gl.UNSIGNED_BYTE;

let convertedPixelData = null;

let lastFloatingPoint = false;
let lastWidth = 0;
let lastHeight = 0;

pUpdate.onTriggered = function ()
{
    const realTexture = tex.get(), gl = cgl.gl;

    if (!realTexture) return;
    if (!fb) fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    let channels = gl.RGBA;
    // channels = gl.R;

    let numChannels = 4;
    // numChannels = 1;

    if (texChanged)
    {
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, realTexture.tex, 0
        );

        isFloatingPoint = realTexture.textureType == CGL.Texture.TYPE_FLOAT;

        if (isFloatingPoint) channelType = gl.FLOAT;
        else channelType = gl.UNSIGNED_BYTE;

        outIsFloatingPoint.set(isFloatingPoint);

        if (
            lastFloatingPoint != isFloatingPoint ||
            lastWidth != realTexture.width ||
            lastHeight != realTexture.height)
        {
            const size = realTexture.width * realTexture.height * numChannels;
            if (isFloatingPoint) pixelData = new Float32Array(size);
            else pixelData = new Uint8Array(size);

            lastFloatingPoint = isFloatingPoint;
            lastWidth = realTexture.width;
            lastHeight = realTexture.height;
        }

        texChanged = false;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.readPixels(
        0, 0,
        realTexture.width,
        realTexture.height,
        channels,
        channelType,
        pixelData
    );

    // if (!convertedPixelData || convertedPixelData.length != pixelData.length) convertedPixelData = new Float32Array(pixelData.length);
    // for (let i = 0; i < pixelData.length; i++)
    // {
    //     convertedPixelData[i] = pixelData[i];
    // }
    if (inNormalize.get() == "0-1")
    {
        if (!convertedPixelData || convertedPixelData.length != pixelData.length) convertedPixelData = new Float32Array(pixelData.length);
        for (let i = 0; i < pixelData.length; i++)
        {
            convertedPixelData[i] = pixelData[i] / 255;
        }
    }
    if (inNormalize.get() == "-1-1")
    {
        if (!convertedPixelData || convertedPixelData.length != pixelData.length) convertedPixelData = new Float32Array(pixelData.length);

        for (let i = 0; i < pixelData.length; i++)
        {
            convertedPixelData[i] = ((pixelData[i] - 128) * 2.0) / 255;
        }
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    outColors.set(null);
    outColors.set(convertedPixelData || pixelData);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    outTrigger.trigger();
};
