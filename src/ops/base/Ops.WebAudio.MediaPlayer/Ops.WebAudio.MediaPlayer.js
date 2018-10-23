/* ports in */
var volume = op.addInPort(new Port(op,"Volume",CABLES.OP_PORT_TYPE_VALUE,{ display:'range' }));
var file = op.addInPort(new Port(op,"File",CABLES.OP_PORT_TYPE_VALUE,{ display:'file',filter:'audio' }));
var play = op.addInPort(new Port(op,"Play", OP_PORT_TYPE_FUNCTION,{ display:'button' }));
var pause = op.addInPort(new Port(op,"Pause", OP_PORT_TYPE_FUNCTION,{ display:'button' }));
var rewind = op.addInPort(new Port(op,"Rewind", OP_PORT_TYPE_FUNCTION,{ display:'button' }));
var seekPosition = op.addInPort(new Port(op,"Seek Position (Seconds)",CABLES.OP_PORT_TYPE_VALUE));
var jumpToSeekPosition = op.addInPort(new Port(op,"Jump To Seek Position", OP_PORT_TYPE_FUNCTION,{ display:'button' }));

/* ports out */
var audioOut = op.addOutPort(new Port(op, "Audio Out",CABLES.OP_PORT_TYPE_OBJECT));
var duration = op.addOutPort(new Port(op,"Duration",CABLES.OP_PORT_TYPE_VALUE));

/* port default values*/
volume.set(1.0);
duration.set(0);

var audioContext = CABLES.WEBAUDIO.createAudioContext(op);

/* vars */
var audio = null;
var media = null;
var source = null;
var isPlaying = false;

function playbackEnded(){
    isPlaying = false;
}

function rewindPlayback(){
    if(audio) { audio.currentTime = 0; }
}

function handleSeek(){
    if(audio) { audio.currentTime = seekPosition.get(); }
}


function startPlayback(){
    if(audio) { audio.play(); }
}

function pausePlayback(){
    if(audio && !audio.paused) { audio.pause(); }
}

function loadMediaFile(){
    if(!file.get()){ return; }
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    var url = op.patch.getFilePath(String(file.get()));
    audio.src = url;
    media = audioContext.createMediaElementSource(audio);
    audio.addEventListener('loadedmetadata', function(){
        duration.set(audio.duration);
    },false);
    audioOut.set(media);
}

function handleFileChange(){
    loadMediaFile();
}

op.onDelete=function() {
    if(audio) audio.pause();
    // TODO: We may need to delete this properly...
};

function handleVolumeChange() {
    if(audio) {
        audio.volume = volume.get();
    }
}

play.onTriggered = startPlayback;
pause.onTriggered = pausePlayback;
rewind.onTriggered = rewindPlayback;
seekPosition.onValueChanged = handleSeek;
jumpToSeekPosition.onTriggered = handleSeek;
file.onValueChanged = handleFileChange;
volume.onValueChanged = handleVolumeChange;
