const
    inTex = op.inTexture("Texture"),
    start = op.inTriggerButton("Trigger"),
    lossless = op.inBool("Lossless (PNG)",true),
    outFinished = op.outValueBool("Finished"),
    outString = op.outString("Base64 string");
const gl = op.patch.cgl.gl;
let fb = null;

start.onTriggered = function ()
{
    if (!inTex.get() || !inTex.get().tex) return;
    outFinished.set(false);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    const width = inTex.get().width;
    const height = inTex.get().height;

    if (!fb)fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, inTex.get().tex, 0);

    const canRead = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (!canRead)
    {
        outFinished.set(true);
        op.error("cannot read texture!");
        return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    const data = new Uint8Array(width * height * 4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Create a 2D canvas to store the result
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    // Copy the pixels to a 2D canvas
    const imageData = context.createImageData(width, height);
    imageData.data.set(data);

    const data2 = imageData.data;

    // flip image
    Array.from({ "length": height }, (val, i) => data2.slice(i * width * 4, (i + 1) * width * 4))
        .forEach((val, i) => data2.set(val, (height - i - 1) * width * 4));

    context.putImageData(imageData, 0, 0);
    if(lossless.get()) {
        outString.set(canvas.toDataURL());
    } else {
        outString.set(canvas.toDataURL('image/jpeg', 1.0));
    }
    outFinished.set(true);
};

function dataURIToBlob(dataURI, callback)
{
    const binStr = atob(dataURI.split(",")[1]),
        len = binStr.length,
        arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = binStr.charCodeAt(i);
    callback(new Blob([arr], { "type": "image/png" }));
}
