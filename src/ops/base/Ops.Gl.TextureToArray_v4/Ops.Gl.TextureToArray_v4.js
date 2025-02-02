const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    tex = op.inObject("texture"),
    outTrigger = op.outTrigger("trigger"),
    outColors = op.outArray("Colors", null, 4),
    outIsFloatingPoint = op.outBoolNum("Floating Point"),
    outNumPixel = op.outNumber("Num Pixel");

let
    fb = null,
    texChanged = false;
tex.onChange = function () { needsUpdate = true; texChanged = true; };

let isFloatingPoint = false;
let channelType = op.patch.cgl.gl.UNSIGNED_BYTE;

let convertedpixel = null;

let lastFloatingPoint = false;
let lastWidth = 0;
let lastHeight = 0;
let pixelReader = new CGL.PixelReader();
let needsUpdate = true;

let numChan = -1;

pUpdate.onLinkChanged = () =>
{
    op.setUiError("texeffect", null);
};

pUpdate.onTriggered = function ()
{
    if (needsUpdate) updateArray();
    outTrigger.trigger();
};

function updateArray()
{
    const realTexture = tex.get(), gl = cgl.gl;

    if (op.patch.cgl.currentTextureEffect) op.setUiError("texeffect", "texcture2colorArray should not be in an imagecompose", 1);

    if (!realTexture) return;
    if (!fb) fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    if (texChanged)
    {
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, realTexture.tex, 0);

        isFloatingPoint = realTexture.isFloatingPoint();

        if (isFloatingPoint) channelType = gl.FLOAT;
        else channelType = gl.UNSIGNED_BYTE;

        outIsFloatingPoint.set(isFloatingPoint);

        if (
            lastFloatingPoint != isFloatingPoint ||
            lastWidth != realTexture.width ||
            lastHeight != realTexture.height)
        {
            lastFloatingPoint = isFloatingPoint;
            lastWidth = realTexture.width;
            lastHeight = realTexture.height;
        }

        texChanged = false;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    pixelReader.read(cgl, fb, realTexture.pixelFormat, 0, 0, realTexture.width, realTexture.height, (pixel) =>
    {
        let origNumChannels = CGL.Texture.getPixelFormatNumChannels(realTexture.pixelFormat);

        if (numChan != origNumChannels)
        {
            outColors.setUiAttribs({ "stride": origNumChannels });
            numChan = origNumChannels;
        }

        if (!convertedpixel || convertedpixel.length != pixel.length) convertedpixel = new Float32Array(pixel.length);

        for (let i = 0; i < pixel.length; i++)
        {
            convertedpixel[i] = pixel[i];
            if (channelType == gl.UNSIGNED_BYTE)convertedpixel[i] /= 255;
        }

        outColors.setRef(convertedpixel || pixel);
        needsUpdate = false;
    });
}
