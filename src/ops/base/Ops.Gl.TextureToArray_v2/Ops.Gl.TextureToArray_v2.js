const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    tex = op.inObject("texture"),
    inFormat = op.inSwitch("Format", ["RGBA", "RGB", "RG", "R", "G", "B", "A"], "RGBA"),
    inForceFloats = op.inBool("Force floats", true),
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

function getNumChannels()
{
    const f = inFormat.get();
    if (f == "RGBA") return 4;
    else if (f == "RGB") return 3;
    else if (f == "RG") return 2;
    else if (f == "R") return 1;
    else if (f == "G") return 1;
    else if (f == "B") return 1;
    else if (f == "A") return 1;
}

inForceFloats.onChange =
inFormat.onChange = () =>
{
    outColors.setUiAttribs({ "stride": getNumChannels() });
    needsUpdate = true;
};

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
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, realTexture.tex, 0
        );

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

        // console.log(pixel.length, realTexture.width, realTexture.height);

        let numItems = (pixel.length / origNumChannels) * getNumChannels();

        outNumPixel.set(numItems);

        if (inFormat.get() === "R")
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i += origNumChannels)
                convertedpixel[i / origNumChannels] = pixel[i + 0];
        }
        else
        if (inFormat.get() === "G")
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i += origNumChannels)
                convertedpixel[i / origNumChannels] = pixel[i + 1];
        }
        else
        if (inFormat.get() === "B")
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i += origNumChannels)
                convertedpixel[i / origNumChannels] = pixel[i + 2];
        }
        else
        if (inFormat.get() === "A")
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i += origNumChannels)
                convertedpixel[i / origNumChannels] = pixel[i + 3];
        }
        else if (inFormat.get() === "RGB")
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i += origNumChannels)
            {
                convertedpixel[i / origNumChannels * 3 + 0] = pixel[i + 0];
                convertedpixel[i / origNumChannels * 3 + 1] = pixel[i + 1];
                convertedpixel[i / origNumChannels * 3 + 2] = pixel[i + 2];
            }
        }
        else if (inFormat.get() === "RG")
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i += origNumChannels)
            {
                convertedpixel[i / origNumChannels * 2 + 0] = pixel[i + 0];
                convertedpixel[i / origNumChannels * 2 + 1] = pixel[i + 1];
            }
        }
        else if (inFormat.get() === "RGBA" && !isFloatingPoint)
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i++)
                convertedpixel[i] = pixel[i];
        }
        else convertedpixel = null;

        if (!isFloatingPoint && convertedpixel)
        {
            if (inForceFloats.get()) for (let i = 0; i < convertedpixel.length; i++)convertedpixel[i] /= 255;
        }

        outColors.setRef(convertedpixel || pixel);
        needsUpdate = false;
    });
}
