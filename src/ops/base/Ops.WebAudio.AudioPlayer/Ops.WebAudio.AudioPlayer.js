var self = this;
var patch=this.patch;
// todo: audio object: firefox does not support .loop=true
//
// myAudio = new Audio('someSound.ogg');
// myAudio.addEventListener('ended', function() {
//     this.currentTime = 0;
//     this.play();
// }, false);
// myAudio.play();




this.name='AudioPlayer';

this.file=op.inFile("file","audio");
var play=op.addInPort(new CABLES.Port(this,"play",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));
var autoPlay=op.addInPort(new CABLES.Port(this,"Autoplay",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

var volume=this.addInPort(new CABLES.Port(this,"volume",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var synchronizedPlayer=this.addInPort(new CABLES.Port(this,"Synchronized Player",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

this.audioOut=this.addOutPort(new CABLES.Port(this, "audio out",CABLES.OP_PORT_TYPE_OBJECT));
var outPlaying=this.addOutPort(new CABLES.Port(this, "playing",CABLES.OP_PORT_TYPE_VALUE));
var outEnded=this.addOutPort(new CABLES.Port(this, "ended",CABLES.OP_PORT_TYPE_FUNCTION));


var doLoop=op.addInPort(new CABLES.Port(this,"Loop",CABLES.OP_PORT_TYPE_VALUE,{ display:'bool' }));

autoPlay.set(true);
volume.set(1.0);

outPlaying.ignoreValueSerialize=true;
outEnded.ignoreValueSerialize=true;

window.AudioContext = window.AudioContext||window.webkitAudioContext;
if(!window.audioContext) window.audioContext = new AudioContext();

if(!window.audioContext) {
    if(this.patch.config.onError) this.patch.config.onError('sorry, could not initialize WebAudio. Please check if your Browser supports WebAudio');
}

this.filter = audioContext.createGain();
self.audio=null;
var buffer=null;
var playing=false;
outPlaying.set(false);


play.onChange=function()
{

    if(!self.audio)
    {
        op.uiAttr({'error':'No audio file selected'});
        return;
    }
    else op.uiAttr({'error':null});


    if(play.get())
    {
        playing=true;
        self.audio.play();
    }
    else
    {
        playing=false;
        self.audio.pause();
    }
    outPlaying.set(playing);
};



this.onDelete=function()
{
    if(self.audio) self.audio.pause();
};


doLoop.onChange=function()
{
    if(self.audio) self.audio.loop=doLoop.get();
    else if(self.media) self.media.loop=doLoop.get();
};

function seek()
{
    // if(!window.gui && CGL.getLoadingStatus()>=1.0)
    // {
    //     console.log('seek canceled',CGL.getLoadingStatus());
    //     return;
    // }

    if(!synchronizedPlayer.get())
    {
        if(!self.audio)return;

        if(self.patch.timer.isPlaying() && self.audio.paused) self.audio.play();
            else if(!self.patch.timer.isPlaying() && !self.audio.paused) self.audio.pause();

        self.audio.currentTime=self.patch.timer.getTime();
    }
    else
    {
        if(buffer===null)return;

        var t=self.patch.timer.getTime();
        if(!isFinite(t))
        {
            return;
            // console.log('not finite time...',t);
            // t=0.0;
        }

        playing=false;

        // console.log('seek.....',self.patch.timer.isPlaying());

        if(self.patch.timer.isPlaying() )
        {
            console.log('play!');
            outPlaying.set(true);

            self.media.start(t);
            playing=true;
        }
    }

}

function playPause()
{
    if(!self.audio)return;

    if(self.patch.timer.isPlaying()) self.audio.play();
        else self.audio.pause();
}

function updateVolume()
{
    // self.filter.gain.value=(volume.get() || 0)*op.patch.config.masterVolume;
    self.filter.gain.setValueAtTime((volume.get() || 0) * op.patch.config.masterVolume, window.audioContext.currentTime);
}

volume.onChange=updateVolume;
op.onMasterVolumeChanged=updateVolume;

var firstTime=true;
var loadingFilename='';
this.file.onChange=function()
{
    if(!self.file.get())return;
    loadingFilename=op.patch.getFilePath(self.file.get());

    var loadingId=patch.loading.start('audioplayer',self.file.get());


    if(!synchronizedPlayer.get())
    {
        if(self.audio)
        {
            self.audio.pause();
            outPlaying.set(false);
        }
        self.audio = new Audio();

// console.log('load audio',self.file.val);

        self.audio.crossOrigin = "anonymous";
        self.audio.src = op.patch.getFilePath(self.file.get());
        self.audio.loop = doLoop.get();
        self.audio.crossOrigin = "anonymous";

        var canplaythrough=function()
        {
            if(autoPlay.get() || play.get()) self.audio.play();
            outPlaying.set(true);
            patch.loading.finished(loadingId);
            self.audio.removeEventListener('canplaythrough',canplaythrough, false);
        };

        self.audio.addEventListener('canplaythrough',canplaythrough, false);

        self.audio.addEventListener('ended',function()
        {
            // console.log('audio player ended...');
            outPlaying.set(false);
            playing=false;
            outEnded.trigger();
        }, false);


        self.media = audioContext.createMediaElementSource(self.audio);
        self.media.connect(self.filter);
        self.audioOut.val = self.filter;
    }
    else
    {
        self.media = audioContext.createBufferSource();
        self.media.loop=doLoop.get();

        var request = new XMLHttpRequest();

        request.open( 'GET', op.patch.getFilePath(self.file.get()), true );
        request.responseType = 'arraybuffer';

        request.onload = function()
        {
            var audioData = request.response;

            audioContext.decodeAudioData( audioData, function(res)
            {
                buffer=res;
                // console.log('sound load complete');
                self.media.buffer = res;
                self.media.connect(self.filter);
                self.audioOut.val = self.filter;
                self.media.loop=doLoop.get();

                patch.loading.finished(loadingId);

                // if(!window.gui)
                // {
                //     self.media.start(0);
                //     playing=true;
                // }
            } );

        };

        request.send();

        self.patch.timer.onPlayPause(seek);
        self.patch.timer.onTimeChange(seek);

    }

};
