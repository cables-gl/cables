const
    cgl = op.patch.cgl,
    pUpdate = op.inTriggerButton("update"),
    inNum = op.inValueInt("Num Points", 2000),
    inSeed = op.inValueFloat("Seed", 1),
    zPos = op.inSwitch("Z Position", ["None", "Red", "Green", "Blue", "Alpha"], "Red"),
    zMultiply = op.inValueFloat("Z Multiply", 1.0),
    tex = op.inObject("texture"),
    outTrigger = op.outTrigger("trigger"),
    outPoints = op.outArray("Points"),
    outPointsNum = op.outNumber("NumPoints");

let fb = null,
    pixelData = null,
    texChanged = false;

op.toWorkPortsNeedToBeLinked(tex, outPoints);

tex.onChange = function () { texChanged = true; };

let channelType = op.patch.cgl.gl.UNSIGNED_BYTE;
let points = [];

pUpdate.onTriggered = updatePixels;

const NUM_COL_CHANNELS = 4;

function updatePixels()
{
    let realTexture = tex.get(), gl = cgl.gl;

    if (!realTexture) return;
    if (!fb) fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);

    if (texChanged)
    {
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D, realTexture.tex, 0
        );

        pixelData = new Uint8Array(realTexture.width * realTexture.height * NUM_COL_CHANNELS);
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

    let num = inNum.get();
    let numPixels = pixelData.length;

    if (num * 3 != points.length)points.length = num * 3;

    Math.randomSeed = inSeed.get();

    let pixelStepX = 1 / realTexture.width;
    let pixelStepY = 1 / realTexture.height;

    let offsetX = pixelStepX * realTexture.width / 2;
    let offsetY = pixelStepY * realTexture.height / 2;

    let ind = 0;
    let count = 0;

    let colChanOffset = 0;
    if (zPos.get() == "Green")colChanOffset = 1;
    else if (zPos.get() == "Blue")colChanOffset = 2;
    else if (zPos.get() == "Alpha")colChanOffset = 3;
    else if (zPos.get() == "None")colChanOffset = 4;

    while (ind < num * 3)
    {
        count++;
        if (count > num * 3 * 100) return;
        let x = Math.floor(Math.seededRandom() * realTexture.width);
        let y = Math.floor(Math.seededRandom() * realTexture.height);
        let intens = pixelData[(x + (y * realTexture.width)) * NUM_COL_CHANNELS + colChanOffset];

        if (intens > 10)
        {
            points[ind++] = ((x * pixelStepX) - (offsetX));
            points[ind++] = ((y * pixelStepY) - (offsetY));

            if (colChanOffset < 4) points[ind++] = (intens / 255) * zMultiply.get();
            else points[ind++] = 0;
        }
    }

    outPointsNum.set(ind / 3);
    outPoints.set(null);
    outPoints.set(points);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    outTrigger.trigger();
}
