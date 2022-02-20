const inTex = op.inTexture("Texture");

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true });

let pixelData = null;
let lastWidth;
let lastHeight;
let fb;
let lastFloatingPoint;

op.renderPreviewLayer = (ctx, pos, size) =>
{
    const
        realTexture = inTex.get(),
        gl = op.patch.cgl.gl;

    if (!realTexture) return;

    ctx.fillStyle = "#222";
    ctx.fillRect(
        pos[0],
        pos[1],
        size[0],
        size[1]
    );

    const sc = 1000 / gui.patchView._patchRenderer.viewBox.zoom * 1.5;

    ctx.save();
    ctx.scale(sc, sc);

    ctx.font = "normal 10px sourceCodePro";
    ctx.fillStyle = "#ccc";

    if (!fb) fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    let channels = gl.RGBA;
    let numChannels = 4;

    let texChanged = true;
    let channelType = gl.UNSIGNED_BYTE;

    if (texChanged)
    {
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, realTexture.tex, 0
        );

        let isFloatingPoint = realTexture.textureType == CGL.Texture.TYPE_FLOAT;
        if (isFloatingPoint) channelType = gl.FLOAT;

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
        Math.min(90, realTexture.width),
        1,
        channels,
        channelType,
        pixelData
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // return pixelData;

    const arr = pixelData;
    let stride = 4;

    if (!arr) return;

    // if (inArr.links.length > 0 && inArr.links[0].getOtherPort(inArr))
    // stride = inArr.links[0].getOtherPort(inArr).uiAttribs.stride || 1;

    let lines = Math.floor(size[1] / sc / 10 - 1);
    let padding = 4;
    let lineHeight = 10;

    let isFp = realTexture.isFloatingPoint();

    if (realTexture && realTexture.getInfoOneLine)
        ctx.fillText(realTexture.getInfoOneLine(),
            pos[0] / sc + padding,
            pos[1] / sc + padding + lineHeight - 2);

    for (let i = 0; i < lines * stride; i += stride)
    {
        ctx.fillStyle = "#666";

        ctx.fillText(i / stride,
            pos[0] / sc + padding,
            pos[1] / sc + lineHeight + lineHeight + i / stride * lineHeight + padding);

        if (inTex.get().isFloatingPoint()) ctx.fillStyle = "rgba(" + arr[i + 0] * 255 + "," + arr[i + 1] * 255 + "," + arr[i + 2] * 255 + "," + arr[i + 3] * 255 + ")";
        else ctx.fillStyle = "rgba(" + arr[i + 0] + "," + arr[i + 1] + "," + arr[i + 2] + "," + arr[i + 3] + ")";

        ctx.fillRect(
            pos[0] / sc + padding + 25,
            pos[1] / sc + lineHeight + lineHeight + i / stride * lineHeight + padding - 7,
            15, 8);

        ctx.fillStyle = "#ccc";

        if (i + stride > arr.length) continue;

        for (let s = 0; s < stride; s++)
        {
            let str = "?";
            let v = arr[i + s];

            if (!isFp)v /= 255;

            if (CABLES.UTILS.isNumeric(v)) str = String(Math.round(v * 10000) / 10000);
            else if (typeof v == "string") str = v;
            else if (typeof v == "array") str = "[]";
            else if (typeof v == "object") str = "{}";

            ctx.fillText(str, pos[0] / sc + s * 80 + 70, pos[1] / sc + 10 + i / stride * 10 + padding + lineHeight);
        }
    }

    ctx.restore();
};
