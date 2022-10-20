const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    inCenter = op.inBool("Center", true),
    inThresh = op.inFloatSlider("Threshold Remove", 0),
    inMulZ = op.inFloat("Z Multiply", 1),
    tex = op.inObject("texture"),
    inWidth = op.inFloat("Width", 2),
    inHeight = op.inFloat("Height", 2),
    outTrigger = op.outTrigger("trigger"),
    outCoords = op.outArray("Points"),
    outNum = op.outNumber("Total Points"),
    outMinZ = op.outNumber("Min Z"),
    outMaxZ = op.outNumber("Max Z");

op.setPortGroup("Size", [inWidth, inHeight]);

let
    fb = null,
    pixelData = null,
    coords = null,
    texChanged = false;
tex.onChange = function () { texChanged = true; };

op.toWorkPortsNeedToBeLinked(tex, outCoords);

let isFloatingPoint = false;
let channelType = op.patch.cgl.gl.UNSIGNED_BYTE;

pUpdate.onTriggered = function ()
{
    let realTexture = tex.get(), gl = cgl.gl;

    if (!realTexture)
    {
        outCoords.set(null);
        outMaxZ.set(0);
        outNum.set(0);
        return;
    }
    if (!fb) fb = gl.createFramebuffer();
    if (!coords)coords = [];

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    if (texChanged)
    {
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, realTexture.tex, 0
        );

        channelType = gl.UNSIGNED_BYTE;

        const size = realTexture.width * realTexture.height * 4;

        pixelData = new Uint8Array(size);

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

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    coords.length = 0;

    let offX = 0;
    let offY = 0;

    let w = inWidth.get();
    let h = inHeight.get();
    const thresh = inThresh.get() * 256;
    const mulz = inMulZ.get() / 256;
    let maxZ = 0;
    let minZ = 99999999;

    if (inCenter.get())
    {
        offX = realTexture.width / 2;
        offY = realTexture.height / 2;
    }

    for (let x = 0; x < realTexture.width; x++)
    {
        for (let y = 0; y < realTexture.height; y++)
        {
            if (
                pixelData[(x + (y * realTexture.width)) * 4 + 0] >= thresh ||
                pixelData[(x + (y * realTexture.width)) * 4 + 1] >= thresh ||
                pixelData[(x + (y * realTexture.width)) * 4 + 2] >= thresh)
            {
                const zz = pixelData[(x + (y * realTexture.width)) * 4 + 0] * mulz;
                coords.push((x - offX) / realTexture.width * w, (y - offY) / realTexture.height * h,
                    zz);
                maxZ = Math.max(zz, maxZ);
                minZ = Math.min(zz, minZ);
            }
        }
    }

    outMinZ.set(minZ);
    outMaxZ.set(maxZ);
    outCoords.set(null);
    outNum.set(coords.length / 3);
    outCoords.set(coords);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    outTrigger.trigger();
};
