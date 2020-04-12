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
videoElement.setAttribute('autoplay', '');
videoElement.setAttribute('muted', '');
videoElement.setAttribute('playsinline', '');

outEleId.set(eleId);

op.patch.cgl.canvas.parentElement.appendChild(videoElement);

var tex=new CGL.Texture(cgl);
tex.setSize(8,8);
textureOut.set(tex);
var timeout=null;

var canceled=false;

op.onDelete=removeElement;

function removeElement()
{
    videoElement.remove();
}


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

function camInitComplete(stream)
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

}


function startWebcam()
{
    var constraints = { audio: false, video: true };
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    if(navigator.getUserMedia)
    {
        navigator.getUserMedia(constraints, camInitComplete,
            function()
            {
                available.set(false);
                // console.log('error webcam');
            });


    }
    else
    {

        //ios

console.log("THE IOS WAY");
//      var constraints = { audio: true, video: { width: 1280, height: 720 } };

        navigator.mediaDevices.getUserMedia(constraints)
          .then(camInitComplete)
          .catch(function(error) {
            console.log(error.name + ": " + error.message);
          });

    }
    // console.error("[webcamtexture] navigator.getUserMedia is not defined!");

}

startWebcam();
