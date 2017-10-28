op.name='VideoTexture';

// var filename=op.addInPort(new Port(op,"file",OP_PORT_TYPE_VALUE,{ display:'file',type:'string',filter:'video' } ));
var filename=op.inFile("file","video");
var play=op.addInPort(new Port(op,"play",OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var loop=op.addInPort(new Port(op,"loop",OP_PORT_TYPE_VALUE,{ display:'bool' } ));


var volume=op.addInPort(new Port(op,"Volume",OP_PORT_TYPE_VALUE,{ display:'range' } ));
var muted=op.addInPort(new Port(op,"mute",OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var speed=op.addInPort(new Port(op,"speed",OP_PORT_TYPE_VALUE ));

var tfilter=op.inValueSelect("filter",['nearest','linear','mipmap']);
var wrap=op.inValueSelect("wrap",['repeat','mirrored repeat','clamp to edge'],"clamp to edge");

var flip=op.addInPort(new Port(op,"flip",OP_PORT_TYPE_VALUE,{ display:'bool' } ));
var fps=op.addInPort(new Port(op,"fps",OP_PORT_TYPE_VALUE ));
var time=op.addInPort(new Port(op,"set time",OP_PORT_TYPE_VALUE ));
var rewind=op.addInPort(new Port(op,"rewind",OP_PORT_TYPE_FUNCTION,{display:'button'} ));

var inPreload=op.inValueBool("Preload",true);

var textureOut=op.addOutPort(new Port(op,"texture",OP_PORT_TYPE_TEXTURE,{preview:true}));
var outDuration=op.addOutPort(new Port(op,"duration",OP_PORT_TYPE_VALUE));
var outProgress=op.addOutPort(new Port(op,"progress",OP_PORT_TYPE_VALUE));
var outTime=op.addOutPort(new Port(op,"CurrentTime",OP_PORT_TYPE_VALUE));

var loading=op.addOutPort(new Port(op,"Loading",OP_PORT_TYPE_VALUE));


var videoElementPlaying=false;
var embedded=false;
var cgl=op.patch.cgl;
var videoElement=document.createElement('video');
var intervalID=null;
fps.set(25);
speed.set(1);
volume.set(1);
flip.set(true);
var cgl_filter=0;
var cgl_wrap=0;

var emptyTexture=CGL.Texture.getEmptyTexture(cgl);

var tex=null;
textureOut.set(tex);
var timeout=null;

function reInitTexture()
{
    if(tex)tex.delete();
    tex=new CGL.Texture(cgl,
    {
        wrap:cgl_wrap,
        filter:cgl_filter
    });
    
}


rewind.onTriggered=function()
{
    videoElement.currentTime=0;
    textureOut.set(emptyTexture);
    // updateTexture();

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
    
    if(!embedded)
    {
        embedVideo(true);
    }
    
    if(play.get()) 
    {
        videoElement.currentTime=time.get() || 0;

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

tfilter.onChange=function()
{
    if(tfilter.get()=='nearest') cgl_filter=CGL.Texture.FILTER_NEAREST;
    if(tfilter.get()=='linear') cgl_filter=CGL.Texture.FILTER_LINEAR;
    if(tfilter.get()=='mipmap') cgl_filter=CGL.Texture.FILTER_MIPMAP;
    tex=null;
};

wrap.onChange=function()
{
    if(wrap.get()=='repeat') cgl_wrap=CGL.Texture.WRAP_REPEAT;
    if(wrap.get()=='mirrored repeat') cgl_wrap=CGL.Texture.WRAP_MIRRORED_REPEAT;
    if(wrap.get()=='clamp to edge') cgl_wrap=CGL.Texture.WRAP_CLAMP_TO_EDGE;
    tex=null;
    // reload();
};


function updateTexture()
{
    // console.log('videoElement.currentTime',videoElement.currentTime);
    if(!tex)reInitTexture();

    if(!videoElementPlaying)return;
    var perc=(videoElement.currentTime)/videoElement.duration;
    if(!isNaN(perc)) outProgress.set(perc);
    outTime.set(videoElement.currentTime);

    cgl.gl.bindTexture(cgl.gl.TEXTURE_2D, tex.tex);
    tex._setFilter();
    cgl.gl.pixelStorei(cgl.gl.UNPACK_FLIP_Y_WEBGL, flip.get());
    cgl.gl.texImage2D(cgl.gl.TEXTURE_2D, 0, cgl.gl.RGBA, cgl.gl.RGBA, cgl.gl.UNSIGNED_BYTE, videoElement);
    textureOut.set(tex);

    CGL.profileVideosPlaying++;

    if(play.get())
    {
        clearTimeout(timeout);
        timeout=setTimeout( updateTexture, 1000/fps.get() );
    }
    
    if(videoElement.readyState==4) loading.set(false);
        else loading.set(false);
}

function initVideo()
{
    videoElement.controls = false;
    videoElement.muted = muted.get();
    videoElement.loop = loop.get();
    if(play.get()) videoElement.play()
    updateTexture();
}

function updateVolume()
{
    videoElement.volume=(volume.get() || 0)*op.patch.config.masterVolume;
}

volume.onValueChanged=updateVolume;
op.onMasterVolumeChanged=updateVolume;


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

function embedVideo(force)
{
    if(filename.get()!=0 && filename.get().length>1)
    if(inPreload.get()||force)
    {
        // console.log("embedVideo"+filename.get() );
        clearTimeout(timeout);
        loading.set(true);
        videoElement.preload = 'true';
        var url=op.patch.getFilePath(filename.get());
        videoElement.setAttribute('src',url);
        if(!addedListeners)
        {
            addedListeners=true;
            videoElement.addEventListener("canplaythrough", initVideo, true);
            videoElement.addEventListener('loadedmetadata', loadedMetaData );
            videoElement.addEventListener("playing", function() {videoElementPlaying = true;}, true);

        }
        embedded=true
        
    }

}


function loadVideo()
{
    setTimeout(embedVideo,100);
    
}

function reload()
{
    if(!filename.get())return;
    loadVideo();
}

filename.onValueChange(reload);
