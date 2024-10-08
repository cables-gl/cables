const
    inTex = op.inTexture("Texture"),
    inRow = op.inInt("Row Start", 0);

op.setUiAttrib({ "height": 200, "width": 380, "resizable": true, "vizLayerMaxZoom": 2500 });

let pixelReader = new CGL.PixelReader();
let pixelData = null;
let lastWidth;
let lastHeight;
let fb;
let lastFloatingPoint;
let lastRead = 0;
let readPixels = true;
let realTexture = null;
let texRows = 0;
let lines = 0;
let readW = 0, readH = 0;
let pixelInfo = null;
const arr = [];

inTex.onLinkChanged = () =>
{
    op.setUiAttrib({ "extendTitle": "" });
};

op.patch.cgl.on("beginFrame",
    () =>
    {
        const gl = op.patch.cgl.gl;
        const cgl = op.patch.cgl;

        realTexture = inTex.get();

        if (!realTexture) return;

        pixelInfo = CGL.Texture.setUpGlPixelFormat(cgl, realTexture.pixelFormat);

        let channels = gl.RGBA;
        let numChannels = pixelInfo.numColorChannels;

        let channelType = gl.UNSIGNED_BYTE;

        if (performance.now() - lastRead >= 50)readPixels = true;
        let texChanged = true;

        if (readPixels)
        {
            if (!fb) fb = gl.createFramebuffer();

            gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

            gl.framebufferTexture2D(
                gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, realTexture.tex, 0
            );

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            let isFloatingPoint = realTexture.isFloatingPoint();
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

        texRows = Math.max(1, Math.ceil(lines / realTexture.width));
        texRows = Math.min(texRows, realTexture.height);
        readW = realTexture.width;
        if (lines / realTexture.width < 1)readW = realTexture.width * lines / realTexture.width;
        readH = texRows;

        // console.log(readH, readW, realTexture.height - texRows);

        if (readPixels)
        {
            lastRead = performance.now();

            if (!texChanged)
                pixelReader.read(op.patch.cgl, fb, realTexture.pixelFormat, 0, realTexture.height - texRows - Math.max(0, inRow.get()), readW, readH, (pixel) =>
                {
                    pixelData = pixel;
                });
            // gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

            // gl.readPixels(
            //     0,
            //     realTexture.height - texRows,
            //     readW,
            //     readH,
            //     channels,
            //     channelType,
            //     pixelData
            // );

        // gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
    });

op.renderVizLayerGl = (ctx, layer) =>
{
    const gl = op.patch.cgl.gl;

    ctx.fillStyle = "#222";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

    if (!pixelData || !realTexture || !inTex.get()) return;

    lines = Math.floor(layer.height / layer.scale / 10 - 1);

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    ctx.font = "normal 10px sourceCodePro";
    ctx.fillStyle = "#ccc";

    if (!pixelInfo) return;
    arr.length = pixelData.length;
    let stride = 4;
    let padding = 4;
    let lineHeight = 10;
    let isFp = CGL.Texture.isPixelFormatFloat(realTexture.pixelFormat);

    // console.log("rr", readW, readH, lines);

    for (let x = 0; x < readW; x++)
        for (let y = 0; y < readH; y++)
            for (let s = 0; s < stride; s++)
                arr[(x + (y * readW)) * stride + s] = pixelData[((x) + ((readH - y - 1) * readW)) * stride + s];

    if (inTex.links[0] && realTexture && realTexture.getInfoOneLine)
        op.setUiAttrib({ "extendTitle": inTex.links[0].getOtherPort(inTex).name + ": " + realTexture.getInfoOneLine() });

    for (let y = 0; y < readH; y++)
        for (let x = 0; x < readW; x++)
        {
            const count = x + y * readW;

            const i = x * stride + (y * readW * stride);
            const idx = count * stride;

            ctx.fillStyle = "#666";

            let numPadY = String(realTexture.width).length;
            let numPadX = String(realTexture.height).length;

            let idxX = Math.floor(idx / realTexture.height);

            let line = String(x).padStart(numPadX, " ") + "," + String(y + inRow.get()).padStart(numPadY, " ");

            if (y + inRow.get() < realTexture.height && y + inRow.get() >= 0)
            {
                ctx.fillText(
                    line,
                    layer.x / layer.scale + padding,
                    layer.y / layer.scale + lineHeight + i / stride * lineHeight + padding);

                const indexStrWidth = line.length * 9;
                if (isFp) ctx.fillStyle = "rgba(" + arr[idx + 0] * 255 + "," + arr[idx + 1] * 255 + "," + arr[idx + 2] * 255 + "," + arr[idx + 3] * 255 + ")";
                else ctx.fillStyle = "rgba(" + arr[idx + 0] + "," + arr[idx + 1] + "," + arr[idx + 2] + "," + arr[idx + 3] + ")";

                ctx.fillRect(
                    layer.x / layer.scale + padding + indexStrWidth,
                    layer.y / layer.scale + lineHeight + count * lineHeight + padding - 7,
                    15,
                    8);

                ctx.fillStyle = "#ccc";

                for (let s = 0; s < stride; s++)
                {
                    let v = arr[i + s];
                    let str = "" + v;

                    if (!isFp)v /= 255;
                    str = String(Math.round(v * 10000) / 10000);

                    ctx.fillText(str, layer.x / layer.scale + indexStrWidth + 40 + s * 55, layer.y / layer.scale + 10 + (i / stride) * 10 + padding);
                }
            }
        }

    const gradHeight = 30;

    if (lines < readH * readW)
    {
        const radGrad = ctx.createLinearGradient(0, layer.y / layer.scale + layer.height / layer.scale - gradHeight + 5, 0, layer.y / layer.scale + layer.height / layer.scale - gradHeight + gradHeight);
        radGrad.addColorStop(1, "#222");
        radGrad.addColorStop(0, "rgba(34,34,34,0.0)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(layer.x / layer.scale, layer.y / layer.scale + layer.height / layer.scale - gradHeight, 200000, gradHeight);
    }

    ctx.restore();
};
