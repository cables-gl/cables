const
    inTex = op.inTexture("Texture"),
    start = op.inTriggerButton("Download"),
    inFormat = op.inSwitch("Format", ["PNG", "JPEG", "WEBP"], "PNG"),
    inQuality = op.inFloatSlider("Quality", 0.9),
    fileName = op.inString("Filename", "screenshot"),
    outFinished = op.outBoolNum("Finished");

const gl = op.patch.cgl.gl;
let fb = null;

inFormat.onChange = () =>
{
    inQuality.setUiAttribs({ "greyout": inFormat.get() == "PNG" });
};

start.onTriggered = function ()
{
    if (!inTex.get() || !inTex.get().tex) return;
    outFinished.set(false);

    const width = inTex.get().width;
    const height = inTex.get().height;

    if (inTex.get().textureType == CGL.Texture.TYPE_FLOAT) op.setUiError("fptex", "Texture is more than 8 bit, not possible to create files with high precision");
    else op.setUiError("fptex", null);

    if (!fb)fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, inTex.get().tex, 0);

    const canRead = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (!canRead)
    {
        outFinished.set(true);
        op.logError("cannot read texture!");
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
    Array.from({ "length": height }, (val, i) => { return data2.slice(i * width * 4, (i + 1) * width * 4); })
        .forEach((val, i) => { return data2.set(val, (height - i - 1) * width * 4); });

    context.putImageData(imageData, 0, 0);

    const ext = inFormat.get().toLowerCase();

    dataURIToBlob(canvas.toDataURL("image/" + ext, inQuality.get()),
        function (blob)
        {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;

            if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream)
            {
                const reader = new FileReader();
                // var out = new Blob([byte], {type: "application/pdf"});
                reader.onload = function (e)
                {
                    window.location.href = reader.result;
                //   window.open(reader.result);
                };
                reader.readAsDataURL(blob);
            }
            else
            {
                const anchor = document.createElement("a");
                anchor.download = fileName.get() + "." + ext;
                // anchor.target='_blank';
                anchor.href = URL.createObjectURL(blob);
                document.body.appendChild(anchor);
                anchor.click();
            }
            outFinished.set(true);
        });
};

function dataURIToBlob(dataURI, callback)
{
    const binStr = atob(dataURI.split(",")[1]),
        len = binStr.length,
        arr = new Uint8Array(len);
    for (let i = 0; i < len; i++) arr[i] = binStr.charCodeAt(i);
    callback(new Blob([arr], { "type": "image/" + inFormat.get().toLowerCase() }));
}
