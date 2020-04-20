// todo: https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/facingMode

const
    inFacing=op.inSwitch("Facing",['environment','user'],'user'),
    flip=op.inValueBool("flip"),
    fps=op.inValueInt("fps"),
    width=op.inValueInt("Width",640),
    height=op.inValueInt("Height",480),
    inActive=op.inValueBool("Active",true),
    textureOut=op.outTexture("texture"),
    outRatio=op.outValue("Ratio"),
    available=op.outValue("Available"),
    outWidth=op.outNumber("Width"),
    outHeight=op.outNumber("Height"),
    outEleId=op.outString("Element Id");

width.onChange=
    height.onChange=
    inFacing.onChange=startWebcam;

fps.set(30);
flip.set(true);

var cgl=op.patch.cgl;
var videoElement=document.createElement('video');
const eleId="webcam"+CABLES.uuid();
videoElement.style.display="none";
videoElement.setAttribute("id", eleId);
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
    if(videoElement) videoElement.remove();
    clearTimeout(timeout);
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

        outHeight.set(videoElement.videoHeight);
        outWidth.set(videoElement.videoWidth);

        tex.setSize(videoElement.videoWidth,videoElement.videoHeight);

        outRatio.set(videoElement.videoWidth/videoElement.videoHeight);

        videoElement.play();
        updateTexture();
    };
}

function startWebcam()
{
    removeElement();
    var constraints = { audio: false, video: {} };

    constraints.video.facingMode = inFacing.get();
    constraints.video.width = width.get();
    constraints.video.height = height.get();

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

        // the ios way...

        navigator.mediaDevices.getUserMedia(constraints)
          .then(camInitComplete)
          .catch(function(error) {
            console.log(error.name + ": " + error.message);
          });

    }

}

startWebcam();
