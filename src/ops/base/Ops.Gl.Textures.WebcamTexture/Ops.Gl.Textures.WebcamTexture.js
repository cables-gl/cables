op.name="WebcamTexture";

var flip=op.addInPort(new Port(op,"flip",OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var fps=op.addInPort(new Port(op,"fps",OP_PORT_TYPE_VALUE ));
var inActive=op.inValueBool("Active",true);

// var textureOut=op.addOutPort(new Port(op,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));
var textureOut=op.outTexture("texture");

fps.set(30);
flip.set(true);

var cgl=op.patch.cgl;
var videoElement=document.createElement('video');

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
            videoElement.autplay=true;
            videoElement.src = window.URL.createObjectURL(stream);
            videoElement.onloadedmetadata = function(e)
            {
                tex.setSize(videoElement.videoWidth,videoElement.videoHeight);

                videoElement.play();
                updateTexture();
            };
        },
        function()
        {
            console.log('error webcam');
        });
}

startWebcam();
