const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    tex = op.inObject("texture"),
    inNormalize = op.inSwitch("Normalize", ["0-255", "0-1", "-1-1"], "0-255"),
    outTrigger = op.outTrigger("trigger"),
    outColors = op.outArray("Colors"),
    outIsFloatingPoint = op.outValue("Floating Point");
let
    fb = null,
    pixelData = null,
    texChanged = false;
tex.onChange = function () { texChanged = true; };

op.toWorkPortsNeedToBeLinked(tex, outColors);

let isFloatingPoint = false;
let channelType = op.patch.cgl.gl.UNSIGNED_BYTE;


pUpdate.onTriggered = function ()
{
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

        outIsFloatingPoint.set(isFloatingPoint);

        const size = realTexture.width * realTexture.height * 4;
        if (isFloatingPoint) pixelData = new Float32Array(size);
        else pixelData = new Uint8Array(size);

        texChanged = false;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    gl.readPixels(
        0, 0,
        realTexture.width,
        realTexture.height,
        gl.RGBA,
        channelType,
        pixelData
    );


    let convertedPixelData = null;

    if (inNormalize.get() == "0-1")
    {
        convertedPixelData = new Float32Array(pixelData.length);
        for (let i = 0; i < pixelData.length; i++)
        {
            convertedPixelData[i] = pixelData[i] / 255;
        }
    }
    if (inNormalize.get() == "-1-1")
    {
        convertedPixelData = new Float32Array(pixelData.length);
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
