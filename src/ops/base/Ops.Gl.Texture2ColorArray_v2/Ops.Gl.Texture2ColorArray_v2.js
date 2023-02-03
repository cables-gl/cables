const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    tex = op.inObject("texture"),
    inNormalize = op.inSwitch("Normalize", ["0-255", "0-1", "-1-1"], "0-255"),
    outTrigger = op.outTrigger("trigger"),

    outColors = op.outArray("Colors", null, 4),
    outIsFloatingPoint = op.outBoolNum("Floating Point");

let
    fb = null,
    texChanged = false;
tex.onChange = function () { texChanged = true; };

op.toWorkPortsNeedToBeLinked(tex, outColors);

let isFloatingPoint = false;
let channelType = op.patch.cgl.gl.UNSIGNED_BYTE;

let convertedpixel = null;

let lastFloatingPoint = false;
let lastWidth = 0;
let lastHeight = 0;
let pixelReader = new CGL.PixelReader();

pUpdate.onTriggered = function ()
{
    const realTexture = tex.get(), gl = cgl.gl;

    if (!realTexture) return;
    if (!fb) fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    let channels = gl.RGBA;
    let numChannels = 4;

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

            lastFloatingPoint = isFloatingPoint;
            lastWidth = realTexture.width;
            lastHeight = realTexture.height;
        }

        texChanged = false;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    pixelReader.read(cgl, fb, realTexture.textureType, 0, 0, realTexture.width, realTexture.height,
        (pixel) =>
        {
            // let convertedpixel;

            if (inNormalize.get() == "0-1")
            {
                if (!convertedpixel || convertedpixel.length != pixel.length) convertedpixel = new Float32Array(pixel.length);

                for (let i = 0; i < pixel.length; i++)
                {
                    convertedpixel[i] = pixel[i] / 255;
                }
            }
            else if (inNormalize.get() == "-1-1")
            {
                if (!convertedpixel || convertedpixel.length != pixel.length) convertedpixel = new Float32Array(pixel.length);

                for (let i = 0; i < pixel.length; i++)
                {
                    convertedpixel[i] = ((pixel[i] - 128) * 2.0) / 255;
                }
            }
            else
            {
                convertedpixel = null;
            }

            outColors.set(null);
            outColors.set(convertedpixel || pixel);
        });

    outTrigger.trigger();
};
