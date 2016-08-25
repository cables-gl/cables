op.name='VideoTexture';

var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string' } ));
var play=op.addInPort(new Port(op,"play",OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var loop=op.addInPort(new Port(op,"loop",OP_PORT_TYPE_VALUE,{ display:'bool' } ));


var volume=op.addInPort(new Port(op,"Volume",OP_PORT_TYPE_VALUE,{ display:'range' } ));
var muted=op.addInPort(new Port(op,"mute",OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var speed=op.addInPort(new Port(op,"speed",OP_PORT_TYPE_VALUE ));
var flip=op.addInPort(new Port(op,"flip",OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var fps=op.addInPort(new Port(op,"fps",OP_PORT_TYPE_VALUE ));
var time=op.addInPort(new Port(op,"set time",OP_PORT_TYPE_VALUE ));
var rewind=op.addInPort(new Port(op,"rewind",OP_PORT_TYPE_FUNCTION,{display:'button'} ));



var textureOut=op.addOutPort(new Port(op,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));
var outDuration=op.addOutPort(new Port(op,"duration",OP_PORT_TYPE_VALUE));
var outProgress=op.addOutPort(new Port(op,"progress",OP_PORT_TYPE_VALUE));
var outTime=op.addOutPort(new Port(op,"CurrentTime",OP_PORT_TYPE_VALUE));

var loading=op.addOutPort(new Port(op,"Loading",OP_PORT_TYPE_VALUE));


var cgl=op.patch.cgl;
var videoElement=document.createElement('video');
var intervalID=null;
fps.set(25);
speed.set(1);
volume.set(1);

var tex=new CGL.Texture(cgl);
tex.setSize(32,33);
textureOut.set(tex);
var timeout=null;

rewind.onTriggered=function()
{
    videoElement.currentTime=0;
};

time.onValueChanged=function()
{
    videoElement.currentTime=time.get() || 0;
    updateTexture();
};

fps.onValueChanged=function()
{
    if(fps.get()<0.1)fps.set(1);
    clearTimeout(timeout);
    timeout=setTimeout(updateTexture, 1000/fps.get());
};

play.onValueChanged=function()
{
    if(play.get()) 
    {
        videoElement.play();
        updateTexture();
    }
    else videoElement.pause();
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
    
    if(videoElement.readyState==4) loading.set(false);
        else loading.set(false);
}

function startVideo()
{
    videoElement.play();
    videoElement.controls = false;
    videoElement.muted = muted.get();
    videoElement.loop = loop.get();
    updateTexture();
}

volume.onValueChanged=function()
{
    videoElement.volume=volume.get() || 0;
};

function loadedMetaData()
{
    outDuration.set(videoElement.duration);
    // console.log('loaded metadata...');
    // console.log('length ',videoElement.buffered.length);
    // console.log('duration ',videoElement.duration);
    // console.log('bytesTotal ',videoElement.bytesTotal);
    // console.log('bufferedBytes ',videoElement.bufferedBytes);
    // console.log('buffered ',videoElement.buffered);
}


var addedListeners=false;

function loadVideo()
{
    // console.log('start loading...',filename.get());
    clearTimeout(timeout);
    loading.set(true);
    videoElement.preload = 'auto';
    var url=op.patch.getFilePath(filename.get());
    videoElement.setAttribute('src',url);
    if(!addedListeners)
    {
        addedListeners=true;
        videoElement.addEventListener("canplaythrough", startVideo, true);
        videoElement.addEventListener('loadedmetadata', loadedMetaData );
    }
}

function reload()
{
    if(!filename.get())return;
    loadVideo();
}

filename.onValueChange(reload);

