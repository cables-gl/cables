const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    tex = op.inObject("texture"),
    inFormat = op.inSwitch("Format", ["RGBA", "RGB", "RG", "R", "G", "B", "A"], "RGBA"),
    outTrigger = op.outTrigger("trigger"),

    outColors = op.outArray("Colors", null, 4),
    outIsFloatingPoint = op.outBoolNum("Floating Point");

let
    fb = null,
    texChanged = false;
tex.onChange = function () { needsUpdate = true; texChanged = true; };

op.toWorkPortsNeedToBeLinked(tex, outColors);

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

inFormat.onChange = () =>
{
    outColors.setUiAttribs({ "stride": getNumChannels() });
    needsUpdate = true;
};

pUpdate.onTriggered = function ()
{
    if (needsUpdate) updateArray();
    outTrigger.trigger();
};

function updateArray()
{
    const realTexture = tex.get(), gl = cgl.gl;

    if (!realTexture) return;
    if (!fb) fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    if (texChanged)
    {
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, realTexture.tex, 0
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
            lastFloatingPoint = isFloatingPoint;
            lastWidth = realTexture.width;
            lastHeight = realTexture.height;
        }

        texChanged = false;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    pixelReader.read(cgl, fb, realTexture.pixelFormat, 0, 0, realTexture.width, realTexture.height, (pixel) =>
    {
        let numItems = pixel.length;
        numItems = numItems / 4 * getNumChannels();

        if (inFormat.get() === "R")
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i += 4)
                convertedpixel[i / 4] = pixel[i + 0];
        }
        else
        if (inFormat.get() === "G")
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i += 4)
                convertedpixel[i / 4] = pixel[i + 1];
        }
        else
        if (inFormat.get() === "B")
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i += 4)
                convertedpixel[i / 4] = pixel[i + 2];
        }
        else
        if (inFormat.get() === "A")
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i += 4)
                convertedpixel[i / 4] = pixel[i + 3];
        }
        else if (inFormat.get() === "RGB")
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i += 4)
            {
                convertedpixel[i / 4 * 3 + 0] = pixel[i + 0];
                convertedpixel[i / 4 * 3 + 1] = pixel[i + 1];
                convertedpixel[i / 4 * 3 + 2] = pixel[i + 2];
            }
        }
        else if (inFormat.get() === "RG")
        {
            if (!convertedpixel || convertedpixel.length != numItems) convertedpixel = new Float32Array(numItems);

            for (let i = 0; i < pixel.length; i += 4)
            {
                convertedpixel[i / 4 * 2 + 0] = pixel[i + 0];
                convertedpixel[i / 4 * 2 + 1] = pixel[i + 1];
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
            for (let i = 0; i < convertedpixel.length; i++)convertedpixel[i] /= 255;
        }

        outColors.setRef(convertedpixel || pixel);
        needsUpdate = false;
    });
}
