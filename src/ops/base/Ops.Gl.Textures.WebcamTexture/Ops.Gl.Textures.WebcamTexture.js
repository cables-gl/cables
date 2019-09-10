var flip=op.inValueBool("flip");
var fps=op.inValueInt("fps");
var inActive=op.inValueBool("Active",true);
var textureOut=op.outTexture("texture");
var outRatio=op.outValue("Ratio");
var available=op.outValue("Available");
var outEleId=op.outString("Element Id");

fps.set(30);
flip.set(true);

var cgl=op.patch.cgl;
var videoElement=document.createElement('video');
const eleId="webcam"+CABLES.uuid();
videoElement.setAttribute("id", eleId);
videoElement.style.display="none";
outEleId.set(eleId);

    var canvas = op.patch.cgl.canvas.parentElement;
    canvas.appendChild(videoElement);

var tex=new CGL.Texture(cgl);
tex.setSize(8,8);
textureOut.set(tex);
var timeout=null;

var canceled=false;

inActive.onChange=function()
{
    if(inActive.get())
    {
        canceled=false;
        updateTexture();
    }
    else
    {
        canceled=true;
    }

};

fps.onChange=function()
{
    if(fps.get()<1)fps.set(1);
    clearTimeout(timeout);
    timeout=setTimeout(updateTexture, 1000/fps.get());
};

function updateTexture()
{
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex.tex);
    cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, flip.get());

    cgl.gl.texImage2D(cgl.gl.TEXTURE_2D, 0, cgl.gl.RGBA, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, videoElement);
    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, null);

    if(!canceled) timeout=setTimeout(updateTexture, 1000/fps.get());
}

function startWebcam()
{
    var constraints = { audio: false, video: true };
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.getUserMedia(constraints,
        function(stream)
        {
            tex.videoElement=videoElement;
            // videoElement.src = window.URL.createObjectURL(stream);
            videoElement.srcObject = stream;
            //tex.videoElement=stream;
            videoElement.onloadedmetadata = function(e)
            {
                available.set(true);
                tex.setSize(videoElement.videoWidth,videoElement.videoHeight);

                outRatio.set(videoElement.videoWidth/videoElement.videoHeight);

                videoElement.play();
                updateTexture();

            };
        },
        function()
        {
            available.set(false);
            // console.log('error webcam');
        });
}

startWebcam();
