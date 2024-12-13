// STOP UPDATING THIS OP ... use Ops.Color.GradientColorArray

const inGrad = op.inGradient("Gradient"),
    inDir = op.inValueSelect("Direction", ["X", "XX", "Y", "YY", "XY", "YX", "Radial"], "X"),
    inSmoothstep = op.inValueBool("Smoothstep", false),
    inStep = op.inBool("Step", false),
    inFlip = op.inBool("Flip", false),
    inSRGB = op.inBool("sRGB", false),
    inOklab = op.inBool("Oklab", false),
    inSize = op.inValueInt("Size", 256),
    tfilter = op.inSwitch("filter", ["nearest", "linear", "mipmap"], "linear"),
    twrap = op.inValueSelect("wrap", ["clamp to edge", "repeat", "mirrored repeat"], "clamp to edge"),
    inNoise = op.inFloatSlider("Dither", 0),
    inGradArray = op.inArray("Gradient Array"),
    inRandom = op.inTriggerButton("Randomize Colors"),
    outTex = op.outTexture("Texture"),
    outColors = op.outArray("Colors", null, 3),
    outColorPos = op.outArray("Colors Pos", null, 1);

const cgl = op.patch.cgl;
let timeout = null;
inGrad.setUiAttribs({ "editShortcut": true });

const bluenoise = [221, 125, 40, 94, 163, 50, 214, 174, 69, 229, 135, 79, 25, 92, 217, 129, 103, 155, 16, 237, 168, 75, 212, 126, 203, 157, 104, 223, 50, 96, 115, 189, 0, 104, 199, 16, 185, 242, 83, 26, 123, 95, 191, 175, 247, 159, 32, 170, 0, 88, 203, 133, 106, 46, 227, 14, 35, 246, 66, 20, 240, 205, 36, 159, 74, 252, 148, 231, 132, 117, 6, 145, 254, 39, 222, 5, 111, 46, 67, 197, 228, 116, 181, 66, 25, 245, 98, 139, 172, 89, 190, 149, 127, 177, 64, 138, 210, 169, 58, 28, 70, 100, 206, 188, 164, 107, 60, 150, 203, 126, 235, 142, 56, 249, 38, 222, 148, 178, 195, 56, 115, 230, 45, 108, 7, 84, 234, 21, 44, 90, 110, 216, 178, 37, 226, 53, 14, 77, 212, 31, 86, 180, 100, 23, 82, 14, 162, 93, 122, 6, 81, 156, 24, 209, 75, 255, 163, 218, 196, 121, 237, 187, 9, 152, 247, 136, 158, 91, 128, 232, 169, 137, 251, 10, 216, 154, 188, 131, 211, 71, 200, 34, 236, 216, 129, 13, 179, 136, 32, 54, 99, 146, 33, 131, 202, 49, 84, 18, 64, 197, 245, 114, 21, 193, 52, 74, 118, 44, 243, 105, 173, 50, 252, 110, 63, 166, 41, 102, 199, 62, 117, 184, 15, 77, 250, 162, 69, 120, 231, 107, 213, 2, 177, 43, 67, 102, 159, 238, 171, 206, 64, 29, 233, 10, 151, 135, 185, 87, 247, 147, 223, 91, 241, 152, 225, 175, 3, 102, 220, 25, 191, 170, 36, 143, 81, 152, 209, 224, 133, 35, 93, 2, 145, 87, 124, 193, 97, 22, 228, 1, 120, 51, 171, 8, 26, 210, 108, 48, 205, 59, 179, 92, 147, 253, 124, 99, 237, 186, 11, 120, 19, 181, 229, 112, 198, 160, 220, 76, 42, 210, 160, 71, 202, 31, 78, 190, 130, 67, 86, 138, 115, 156, 243, 14, 46, 74, 57, 219, 28, 51, 90, 250, 59, 81, 140, 47, 255, 17, 58, 181, 243, 114, 56, 178, 239, 139, 228, 156, 251, 40, 167, 232, 28, 38, 82, 136, 206, 161, 9, 196, 106, 139, 167, 204, 150, 195, 218, 70, 172, 35, 132, 103, 146, 27, 89, 128, 16, 107, 96, 57, 119, 201, 15, 187, 239, 126, 194, 225, 112, 182, 234, 131, 174, 240, 72, 39, 109, 29, 8, 100, 122, 207, 231, 4, 166, 224, 198, 153, 217, 44, 183, 212, 4, 93, 143, 72, 99, 172, 64, 0, 97, 34, 85, 66, 20, 208, 3, 125, 243, 164, 186, 235, 156, 82, 191, 67, 248, 49, 80, 10, 253, 68, 23, 162, 244, 179, 49, 215, 24, 151, 246, 51, 214, 153, 251, 118, 45, 157, 98, 224, 53, 88, 134, 62, 42, 23, 116, 94, 140, 33, 121, 188, 169, 141, 113, 76, 33, 131, 227, 110, 11, 202, 78, 122, 168, 18, 141, 194, 221, 80, 187, 142, 177, 210, 18, 249, 144, 221, 180, 12, 201, 215, 106, 60, 91, 226, 200, 236, 150, 85, 61, 164, 185, 133, 42, 229, 187, 73, 55, 101, 27, 235, 59, 12, 35, 75, 113, 199, 101, 163, 237, 57, 152, 174, 234, 134, 1, 37, 53, 123, 193, 6, 208, 253, 34, 91, 145, 104, 8, 240, 211, 175, 129, 164, 109, 253, 123, 230, 171, 6, 50, 79, 27, 127, 73, 43, 19, 246, 161, 211, 103, 17, 172, 96, 46, 117, 70, 241, 219, 27, 162, 115, 88, 38, 4, 148, 204, 92, 189, 154, 63, 130, 217, 188, 111, 254, 208, 101, 86, 191, 144, 75, 180, 249, 65, 137, 233, 157, 18, 171, 192, 49, 66, 201, 137, 246, 218, 51, 71, 15, 43, 214, 29, 95, 239, 38, 139, 165, 7, 225, 124, 30, 59, 112, 221, 154, 28, 197, 217, 106, 58, 85, 209, 128, 232, 151, 15, 79, 182, 120, 238, 168, 134, 81, 248, 146, 173, 16, 88, 195, 65, 150, 183, 205, 242, 11, 41, 89, 126, 80, 8, 183, 121, 141, 3, 98, 180, 31, 108, 58, 196, 97, 24, 222, 107, 198, 2, 116, 70, 207, 52, 230, 22, 109, 47, 80, 165, 132, 199, 235, 170, 52, 148, 247, 165, 23, 242, 74, 45, 254, 170, 226, 155, 36, 142, 179, 60, 158, 48, 182, 223, 154, 124, 98, 178, 250, 140, 5, 231, 96, 68, 19, 116, 204, 32, 227, 43, 200, 113, 161, 213, 122, 87, 0, 130, 248, 77, 13, 241, 92, 229, 30, 102, 13, 244, 77, 160, 33, 209, 119, 55, 176, 143, 190, 255, 103, 71, 93, 186, 62, 223, 145, 12, 189, 68, 202, 47, 211, 114, 192, 41, 127, 203, 141, 65, 189, 40, 135, 198, 61, 89, 222, 158, 24, 216, 45, 1, 157, 213, 130, 239, 83, 104, 26, 55, 134, 238, 29, 159, 95, 63, 167, 149, 7, 78, 255, 119, 166, 212, 1, 233, 19, 105, 186, 37, 244, 110, 86, 135, 56, 173, 11, 151, 36, 176, 196, 230, 94, 149, 109, 184, 226, 20, 236, 215, 105, 175, 22, 219, 52, 87, 111, 174, 128, 248, 149, 78, 125, 63, 184, 227, 242, 118, 22, 220, 138, 252, 119, 76, 168, 39, 250, 10, 136, 84, 123, 54, 69, 194, 37, 95, 147, 241, 73, 153, 48, 68, 7, 194, 17, 207, 161, 31, 76, 201, 90, 166, 69, 4, 48, 215, 21, 204, 57, 73, 176, 200, 30, 249, 155, 133, 233, 163, 9, 197, 32, 183, 220, 205, 137, 232, 167, 94, 144, 9, 105, 181, 44, 111, 207, 99, 132, 155, 182, 85, 127, 219, 147, 42, 97, 184, 5, 83, 208, 108, 61, 125, 228, 21, 100, 39, 90, 114, 53, 218, 41, 252, 129, 61, 234, 143, 30, 192, 245, 12, 112, 236, 101, 2, 244, 113, 165, 225, 118, 47, 20, 176, 251, 142, 84, 117, 160, 254, 177, 26, 238, 121, 72, 193, 213, 153, 13, 55, 173, 79, 224, 65, 140, 34, 195, 158, 54, 17, 206, 62, 144, 240, 190, 72, 40, 214, 54, 192, 5, 146, 60, 82, 185, 3, 138, 169, 25, 83, 245];
const bluenoiseSize = 32;

inNoise.onChange =
twrap.onChange =
    tfilter.onChange =
    inStep.onChange =
    inFlip.onChange =
    inSRGB.onChange =
    inOklab.onChange =
    inSize.onChange =
    inGrad.onChange =
    inSmoothstep.onChange =
    inDir.onChange =
    inGradArray.onChange = update;

inGrad.set("{\"keys\" : [{\"pos\":0,\"r\":0,\"g\":0,\"b\":0},{\"pos\":1,\"r\":1,\"g\":1,\"b\":1}]}");

op.onLoaded = update;

inRandom.onTriggered = () =>
{
    const keys = parseKeys();
    if (keys)
    {
        keys.forEach((key) =>
        {
            key.r = Math.random();
            key.g = Math.random();
            key.b = Math.random();
        });
        const newKeys = JSON.stringify({ "keys": keys });
        inGrad.set(newKeys);
    }
};

function rgbToOklab(r, g, b)
{
    let l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
    let m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
    let s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;
    l = Math.cbrt(l); m = Math.cbrt(m); s = Math.cbrt(s);
    return [
        l * +0.2104542553 + m * +0.7936177850 + s * -0.0040720468,
        l * +1.9779984951 + m * -2.4285922050 + s * +0.4505937099,
        l * +0.0259040371 + m * +0.7827717662 + s * -0.8086757660
    ];
}

function oklabToRGB(L, a, b)
{
    let l = L + a * +0.3963377774 + b * +0.2158037573;
    let m = L + a * -0.1055613458 + b * -0.0638541728;
    let s = L + a * -0.0894841775 + b * -1.2914855480;
    l **= 3; m **= 3; s **= 3;
    let rgb_r = l * +4.0767416621 + m * -3.3077115913 + s * +0.2309699292;
    let rgb_g = l * -1.2684380046 + m * +2.6097574011 + s * -0.3413193965;
    let rgb_b = l * -0.0041960863 + m * -0.7034186147 + s * +1.7076147010;
    rgb_r = CABLES.clamp(rgb_r, 0, 1); rgb_g = CABLES.clamp(rgb_g, 0, 1); rgb_b = CABLES.clamp(rgb_b, 0, 1);
    return [rgb_r, rgb_g, rgb_b];
}

function lin2srgb(r, g, b)
{
    r /= 255;
    const thr = 0.0031308;
    let c_loR = 12.92 * r;
    let c_hiR = 1.055 * Math.pow(r, 0.41666) - 0.055;
    return ((r < thr) ? c_loR : c_hiR) * 255;
}

function update()
{
    cgl.addNextFrameOnceCallback(doUpdate);
}

function doUpdate()
{
    const keys = parseKeys();
    if (keys) updateGradient(keys);
}

function parseKeys()
{
    let keys = null;
    op.setUiError("nodata", null);
    op.setUiError("parse", null);

    if (Array.isArray(inGradArray.get()))
    {
        keys = inGradArray.get();
    }
    else
    {
        let grad = null;
        if (!inGrad.get() || inGrad.get() === "")
        {
            // op.setUiError("nodata", "gradient no data");
            return null;
        }

        try
        {
            grad = JSON.parse(inGrad.get());
        }
        catch (e)
        {
            op.setUiError("parse", "could not parse gradient data");
        }

        if (!grad || !grad.keys)
        {
            op.setUiError("nodata", "gradient no data");
            return null;
        }
        keys = grad.keys;
    }
    return keys;
}

function noise(x, y)
{
    x %= bluenoiseSize;
    y %= bluenoiseSize;

    return bluenoise[x + y * bluenoiseSize] / 255 - 0.5;
}

function addNoise(pixels, width, height)
{
    if (inNoise.get() == 0.0) return pixels;

    for (let x = 0; x < width; x++)
        for (let y = 0; y < height; y++)
        {
            const r1 = pixels[(x + (y * width)) * 4 + 0];
            const g1 = pixels[(x + (y * width)) * 4 + 1];
            const b1 = pixels[(x + (y * width)) * 4 + 2];

            let offX = (width / 8) * inNoise.get() * noise(x, y);
            let offY = (height / 8) * inNoise.get() * noise(x + bluenoiseSize / 2, y + bluenoiseSize / 2);

            if (height == 1) offY = 0;
            if (width == 1) offX = 0;

            offX = Math.round(offX);
            offY = Math.round(offY);

            const yOffY = CABLES.clamp(y + offY, 0, height - 1);
            const xOffX = CABLES.clamp(x + offX, 0, width - 1);

            const r2 = pixels[(xOffX + ((yOffY) * width)) * 4 + 0];
            const g2 = pixels[(xOffX + ((yOffY) * width)) * 4 + 1];
            const b2 = pixels[(xOffX + ((yOffY) * width)) * 4 + 2];

            pixels[(x + y * width) * 4 + 0] = r2;
            pixels[(x + y * width) * 4 + 1] = g2;
            pixels[(x + y * width) * 4 + 2] = b2;

            pixels[(xOffX + ((yOffY) * width)) * 4 + 0] = r1;
            pixels[(xOffX + ((yOffY) * width)) * 4 + 1] = g1;
            pixels[(xOffX + ((yOffY) * width)) * 4 + 2] = b1;
        }
    return pixels;
}

function updateGradient(keys)
{
    let width = Math.round(inSize.get());
    if (width < 4) width = 4;

    inGrad.setUiAttribs(
        {
            "editShortcut": true,
            "gradEditSmoothstep": inSmoothstep.get(),
            "gradEditStep": inStep.get(),
            "gradOklab": inOklab.get()
        });

    let selectedWrap = 0;
    let selectedFilter = 0;
    if (twrap.get() == "repeat") selectedWrap = CGL.Texture.WRAP_REPEAT;
    else if (twrap.get() == "mirrored repeat") selectedWrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    else if (twrap.get() == "clamp to edge") selectedWrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    if (tfilter.get() == "nearest") selectedFilter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") selectedFilter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") selectedFilter = CGL.Texture.FILTER_MIPMAP;

    const tex = new CGL.Texture(cgl);

    let pixels = new Uint8Array(width * 4);

    for (let i = 0; i < keys.length - 1; i++)
    {
        const keyA = keys[i];
        const keyB = keys[i + 1];

        for (let x = keyA.pos * width; x < keyB.pos * width; x++)
        {
            let p = CABLES.map(x, keyA.pos * width, keyB.pos * width, 0, 1);
            if (inStep.get())p = Math.round(p);
            if (inSmoothstep.get()) p = CABLES.smoothStep(p);
            x = Math.round(x);

            let xx = x;
            if (inFlip.get())xx = width - x - 1;

            if (inOklab.get())
            {
                const klabA = rgbToOklab(keyA.r, keyA.g, keyA.b);
                const labA_r = klabA[0];
                const labA_g = klabA[1];
                const labA_b = klabA[2];

                const klabB = rgbToOklab(keyB.r, keyB.g, keyB.b);
                const labB_r = klabB[0];
                const labB_g = klabB[1];
                const labB_b = klabB[2];

                const l = ((p * labB_r + (1.0 - p) * labA_r));
                const a = ((p * labB_g + (1.0 - p) * labA_g));
                const b = ((p * labB_b + (1.0 - p) * labA_b));

                const pixCol = oklabToRGB(l, a, b);
                pixels[xx * 4 + 0] = Math.round(pixCol[0] * 255);
                pixels[xx * 4 + 1] = Math.round(pixCol[1] * 255);
                pixels[xx * 4 + 2] = Math.round(pixCol[2] * 255);
            }
            else
            {
                pixels[xx * 4 + 0] = Math.round((p * keyB.r + (1.0 - p) * keyA.r) * 255);
                pixels[xx * 4 + 1] = Math.round((p * keyB.g + (1.0 - p) * keyA.g) * 255);
                pixels[xx * 4 + 2] = Math.round((p * keyB.b + (1.0 - p) * keyA.b) * 255);
            }

            if (typeof keyA.a !== "undefined" && typeof keyB.a !== "undefined")
            {
                const alpha = Math.round((p * keyB.a + (1.0 - p) * keyA.a) * 255);
                pixels[xx * 4 + 3] = alpha;
            }
            else
            {
                pixels[xx * 4 + 3] = Math.round(255);
            }
        }
    }
    if (inSRGB.get())
        for (let i = 0; i < pixels.length; i += 4)
        {
            pixels[i + 0] = lin2srgb(pixels[i + 0]);
            pixels[i + 1] = lin2srgb(pixels[i + 1]);
            pixels[i + 2] = lin2srgb(pixels[i + 2]);
        }

    if (inDir.get() == "X") tex.initFromData(addNoise(pixels, width, 1), width, 1, selectedFilter, selectedWrap);
    if (inDir.get() == "Y") tex.initFromData(addNoise(pixels, 1, width), 1, width, selectedFilter, selectedWrap);

    if (inDir.get() == "Radial")
    {
        const rpixels = new Uint8Array(width * width * 4);

        for (let x = 0; x < width; x++)
        {
            for (let y = 0; y < width; y++)
            {
                const dx = x - (width - 1) / 2;
                const dy = y - (width - 1) / 2;
                let pos = Math.sqrt(dx * dx + dy * dy) / (width) * 2;

                if (inSmoothstep.get()) pos = CABLES.smoothStep(pos);

                let aa = Math.round(pos * width) * 4;
                if (aa >= width * 4)aa = width * 4 - 4;

                rpixels[(x * 4) + (y * 4 * width) + 0] = pixels[aa + 0];
                rpixels[(x * 4) + (y * 4 * width) + 1] = pixels[aa + 1];
                rpixels[(x * 4) + (y * 4 * width) + 2] = pixels[aa + 2];
                rpixels[(x * 4) + (y * 4 * width) + 3] = Math.round(255);
            }
        }

        pixels = rpixels;

        tex.initFromData(addNoise(pixels, width, width), width, width, selectedFilter, selectedWrap);
    }

    if (inDir.get() == "XX")
    {
        const rpixels = new Uint8Array(width * width * 4);
        for (let x = 0; x < width; x++)
            for (let y = 0; y < width; y++)
            {
                const aa = x * 4;
                rpixels[(x * 4) + (y * 4 * width) + 0] = pixels[aa + 0];
                rpixels[(x * 4) + (y * 4 * width) + 1] = pixels[aa + 1];
                rpixels[(x * 4) + (y * 4 * width) + 2] = pixels[aa + 2];
                rpixels[(x * 4) + (y * 4 * width) + 3] = Math.round(255);
            }
        pixels = rpixels;
        tex.initFromData(addNoise(pixels, width, width), width, width, selectedFilter, selectedWrap);
    }

    if (inDir.get() == "YY")
    {
        const rpixels = new Uint8Array(width * width * 4);
        for (let x = 0; x < width; x++)
            for (let y = 0; y < width; y++)
            {
                const aa = x * 4;
                rpixels[(y * 4) + (x * 4 * width) + 0] = pixels[aa + 0];
                rpixels[(y * 4) + (x * 4 * width) + 1] = pixels[aa + 1];
                rpixels[(y * 4) + (x * 4 * width) + 2] = pixels[aa + 2];
                rpixels[(y * 4) + (x * 4 * width) + 3] = Math.round(255);
            }
        pixels = rpixels;
        tex.initFromData(addNoise(pixels, width, width), width, width, selectedFilter, selectedWrap);
    }

    if (inDir.get() == "XY" || inDir.get() == "YX")
    {
        const rpixels = new Uint8Array(width * width * 4);

        for (let x = 0; x < width; x++)
        {
            let xx = x;
            if (inDir.get() == "YX")xx = width - x - 1;

            for (let y = 0; y < width; y++)
            {
                let aa = Math.round(((xx) + y) / 2) * 4;

                rpixels[(x * 4) + (y * 4 * width) + 0] = pixels[aa + 0];
                rpixels[(x * 4) + (y * 4 * width) + 1] = pixels[aa + 1];
                rpixels[(x * 4) + (y * 4 * width) + 2] = pixels[aa + 2];
                rpixels[(x * 4) + (y * 4 * width) + 3] = Math.round(255);
            }
        }

        pixels = rpixels;

        tex.initFromData(addNoise(pixels, width, width), width, width, selectedFilter, selectedWrap);
    }

    const colorArr = [];
    for (let i = 0; i < keys.length - 1; i++)
    {
        colorArr.push(keys[i].r, keys[i].g, keys[i].b);
    }

    const colorPosArr = [];
    for (let i = 0; i < keys.length - 1; i++)
    {
        colorPosArr.push(keys[i].pos);
    }

    outColors.set(colorArr);
    outColorPos.set(colorPosArr);

    // outTex.set(null);
    outTex.setRef(tex);
}
