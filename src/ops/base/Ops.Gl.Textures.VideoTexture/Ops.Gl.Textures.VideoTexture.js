op.name='VideoTexture';

var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string' } ));
var play=op.addInPort(new Port(op,"play",OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var loop=op.addInPort(new Port(op,"loop",OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var flip=op.addInPort(new Port(op,"flip",OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var muted=op.addInPort(new Port(op,"mute",OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var speed=op.addInPort(new Port(op,"speed",OP_PORT_TYPE_VALUE ));
var fps=op.addInPort(new Port(op,"fps",OP_PORT_TYPE_VALUE ));



var textureOut=op.addOutPort(new Port(op,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));
var outDuration=op.addOutPort(new Port(op,"duration",OP_PORT_TYPE_VALUE));
var outProgress=op.addOutPort(new Port(op,"progress",OP_PORT_TYPE_VALUE));
var outTime=op.addOutPort(new Port(op,"time",OP_PORT_TYPE_VALUE));

var cgl=op.patch.cgl;
var videoElement=document.createElement('video');
var intervalID=null;
fps.set(25);
speed.set(1);

var tex=new CGL.Texture(cgl);
tex.setSize(32,33);
textureOut.set(tex);
var timeout=null;

fps.onValueChanged=function()
{
    if(fps.get()<0.1)fps.set(1);
    clearTimeout(timeout);
};

play.onValueChanged=function()
{
    if(play.get()) videoElement.play();
        else  videoElement.pause();

};

speed.onValueChanged=function()
{
    videoElement.playbackRate = speed.get();
};

loop.onValueChanged=function()
{
    videoElement.loop = loop.get();
};

muted.onValueChanged=function()
{
    videoElement.muted = muted.get();
};

function updateTexture()
{
    var perc=(videoElement.currentTime)/videoElement.duration;
    if(!isNaN(perc)) outProgress.set(perc);
    outTime.set(videoElement.currentTime);

    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex.tex);
    cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, flip.get());
    cgl.gl.texImage2D(cgl.gl.TEXTURE_2D, 0, cgl.gl.RGBA, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, videoElement);

    if(play.get())
    {
        clearTimeout(timeout);
        timeout=setTimeout(updateTexture, 1000/fps.get());
    }
}

function startVideo()
{
    videoElement.play();
    videoElement.controls = false;
    videoElement.muted = muted.get();
    videoElement.loop = loop.get();
    updateTexture();
}

function loadedMetaData()
{
    console.log('loaded metadata...');
    outDuration.set(videoElement.duration);
    console.log('length ',videoElement.buffered.length);
    console.log('duration ',videoElement.duration);
    console.log('bytesTotal ',videoElement.bytesTotal);
    console.log('bufferedBytes ',videoElement.bufferedBytes);
    console.log('buffered ',videoElement.buffered);
}

function reload()
{
    videoElement.preload = 'auto';
    videoElement.setAttribute('src',filename.get());
    videoElement.addEventListener("canplaythrough", startVideo, true);

    videoElement.addEventListener('loadedmetadata', loadedMetaData );

}

filename.onValueChange(reload);

