const
    cgl = op.patch.cgl,
    pUpdate = op.inTrigger("update"),
    // inNormalize = op.inSwitch("Coordinate", ["Pixel", "Normalized"], "Pixel"),
    inX = op.inInt("X", 0),
    inY = op.inInt("Y", 0),
    tex = op.inTexture("texture"),
    outTrigger = op.outTrigger("trigger"),
    outR = op.outNumber("Red"),
    outG = op.outNumber("Green"),
    outB = op.outNumber("Blue"),
    outA = op.outNumber("Alpha");

let
    pbo = null,
    fb = null,
    pixelData = null,
    wasTriggered = true,
    texChanged = false;

let finishedFence = true;
tex.onChange = function () { texChanged = true; };

let isFloatingPoint = false;
let channelType = op.patch.cgl.gl.UNSIGNED_BYTE;

function fence()
{
    finishedFence = false;
    return new Promise(function (resolve, reject)
    {
        const gl = op.patch.cgl.gl;
        let sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
        if (!sync) return;
        gl.flush(); // Ensure the fence is submitted.
        function check()
        {
            const status = gl.clientWaitSync(sync, 0, 0);

            if (status == gl.WAIT_FAILED)
            {
                if (reject) reject();
            }
            else
            if (status == gl.TIMEOUT_EXPIRED)
            {
                setTimeout(check, 0);
            }
            else
            if (status == gl.CONDITION_SATISFIED)
            {
                resolve();
                gl.deleteSync(sync);
            }
            else
            {
                console.log("unknown fence status", status);
            }
        }

        check();
    });
}

pUpdate.onTriggered = function ()
{
    const realTexture = tex.get();
    const gl = cgl.gl;

    if (!realTexture) return;
    if (!fb) fb = gl.createFramebuffer();
    isFloatingPoint = realTexture.textureType == CGL.Texture.TYPE_FLOAT;

    if (isFloatingPoint) channelType = gl.FLOAT;
    else channelType = gl.UNSIGNED_BYTE;

    const size = 4 * 4;
    if (!pixelData)
        if (isFloatingPoint) pixelData = new Float32Array(size);
        else pixelData = new Uint8Array(size);

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(
        gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D, realTexture.tex, 0
    );

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (finishedFence)
    {
        pbo = gl.createBuffer();
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
        gl.bufferData(gl.PIXEL_PACK_BUFFER, 4 * 4, gl.DYNAMIC_READ);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);

        gl.readPixels(
            inX.get(), inY.get(),
            1, 1,
            gl.RGBA,
            channelType,
            0
        );

        gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    if (finishedFence)
        fence().then(function ()
        {
            let starttime = performance.now();
            wasTriggered = false;
            texChanged = false;

            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, pbo);
            gl.getBufferSubData(gl.PIXEL_PACK_BUFFER, 0, pixelData);
            gl.bindBuffer(gl.PIXEL_PACK_BUFFER, null);
            finishedFence = true;
            gl.deleteBuffer(pbo);

            if (isFloatingPoint)
            {
                outR.set(pixelData[0]);
                outG.set(pixelData[1]);
                outB.set(pixelData[2]);
                outA.set(pixelData[3]);
            }
            else
            {
                outR.set(pixelData[0] / 255);
                outG.set(pixelData[1] / 255);
                outB.set(pixelData[2] / 255);
                outA.set(pixelData[3] / 255);
            }
        });

    outTrigger.trigger();
};
