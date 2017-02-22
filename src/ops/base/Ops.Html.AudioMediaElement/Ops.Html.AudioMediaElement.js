op.name='AudioMediaElement';

var fileName=op.inFile("file","audio");
var inPlay=op.inValueBool("Play");
var volume=op.inValueSlider("Volume");
var outPlaying=op.outValue("Playing");
var outEnded=op.outFunction("Has Ended");

var doLoop=op.inValueBool("Loop");


volume.set(1.0);
var audio=null;
var playing=false;
outPlaying.set(false);
volume.onChange=updateVolume;


function play()
{
    if(audio)
    {
        playing=true;
        audio.play();
    }
}

inPlay.onValueChanged=function()
{
    if(inPlay.get())
    {
        play();
    }
    else
    {
        playing=false;
        audio.pause();
    }
    outPlaying.set(playing);
};

this.onDelete=function()
{
    if(audio) audio.pause();
};

doLoop.onValueChanged=function()
{
    if(audio) audio.loop=doLoop.get();
};


function playPause()
{
    if(!audio)return;

    if(op.patch.timer.isPlaying()) audio.play();
        else audio.pause();
}

function updateVolume()
{
    if(audio)audio.volume=volume.get()*op.patch.config.masterVolume;
}

op.onMasterVolumeChanged=updateVolume;


fileName.onValueChanged = function()
{
    if(!fileName.get())return;

    var loadingId=op.patch.loading.start('audioplayer',fileName.get());

    if(audio)
    {
        audio.pause();
        outPlaying.set(false);
    }
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = op.patch.getFilePath(fileName.get());
    audio.loop = doLoop.get();
    audio.crossOrigin = "anonymous";

    var canplaythrough=function()
    {
        if(inPlay.get()) play();
        op.patch.loading.finished(loadingId);
        audio.removeEventListener('canplaythrough',canplaythrough, false);
    };

    audio.addEventListener('canplaythrough',canplaythrough, false);
    
    audio.addEventListener('ended',function()
    {
        outPlaying.set(false);
        playing=false;
        outEnded.trigger();
        if(doLoop.get()) play();
    }, false);
    



};
