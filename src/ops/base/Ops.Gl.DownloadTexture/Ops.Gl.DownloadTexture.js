const
    inTex=op.inTexture("Texture"),
    start=op.inTriggerButton("Download"),
    fileName=op.inValueString("Filename",'screenshot'),
    outFinished=op.outValueBool("Finished")
    ;

const gl=op.patch.cgl.gl;
var fb=null;

start.onTriggered=function()
{
    if(!inTex.get() || !inTex.get().tex)return;
    outFinished.set(false);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    var width=inTex.get().width;
    var height=inTex.get().height;

    if(!fb)fb = gl.createFramebuffer();

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D( gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, inTex.get().tex, 0);

    var canRead = (gl.checkFramebufferStatus(gl.FRAMEBUFFER) == gl.FRAMEBUFFER_COMPLETE);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    if (!canRead)
    {
        outFinished.set(true);
        console.log('cannot read texture!');
        return;
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    var data = new Uint8Array(width*height*4);
    gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // Create a 2D canvas to store the result
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');

    // Copy the pixels to a 2D canvas
    var imageData = context.createImageData(width, height);
    imageData.data.set(data);

    const data2 = imageData.data;

    // flip image
    Array.from({length: height}, (val, i) => data2.slice(i * width * 4, (i + 1) * width * 4))
        .forEach((val, i) => data2.set(val, (height - i - 1) * width * 4));

    context.putImageData(imageData, 0, 0);

    dataURIToBlob(canvas.toDataURL(),
        function(blob)
        {
            var anchor = document.createElement('a');
            anchor.download=fileName.get()+'.png';
            anchor.href=URL.createObjectURL(blob);
            document.body.appendChild(anchor);

            anchor.click();
            outFinished.set(true);
        });
};

function dataURIToBlob(dataURI, callback)
{
    var binStr = atob(dataURI.split(',')[1]),
    len = binStr.length,
    arr = new Uint8Array(len);
    for (var i = 0; i < len; i++) arr[i] = binStr.charCodeAt(i);
    callback(new Blob([arr]));
}