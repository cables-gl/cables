/* ports in */
const file = op.inUrl("File", "audio");
const volume = op.inFloatSlider("Volume", 1);
const play = op.inTriggerButton("Play");
const pause = op.inTriggerButton("Pause");
const rewind = op.inTriggerButton("Rewind");
const jumpToSeekPosition = op.inTriggerButton("Jump To Seek Position");
const seekPosition = op.inFloat("Seek Position (Seconds)", 0);

op.setPortGroup("Playback Options", [volume, play, pause, rewind]);
op.setPortGroup("Seek Options", [seekPosition, jumpToSeekPosition]);
/* ports out */
const audioOut = op.outObject("Audio Out");
const duration = op.outNumber("Duration");

let audioContext = CABLES.WEBAUDIO.createAudioContext(op);

/* vars */
let audio = null;
let media = null;
let source = null;
let isPlaying = false;

function playbackEnded()
{
    isPlaying = false;
}

function rewindPlayback()
{
    if (audio) { audio.currentTime = 0; }
}

function handleSeek()
{
    if (audio) { audio.currentTime = seekPosition.get(); }
}

function startPlayback()
{
    if (audio) { audio.play(); }
}

function pausePlayback()
{
    if (audio && !audio.paused) { audio.pause(); }
}

function loadMediaFile()
{
    if (!file.get()) { return; }
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    let url = op.patch.getFilePath(String(file.get()));
    audio.src = url;
    media = audioContext.createMediaElementSource(audio);
    audio.addEventListener("loadedmetadata", function ()
    {
        duration.set(audio.duration);
    }, false);

    audioOut.set(media);
}

function handleFileChange()
{
    loadMediaFile();
}

op.onDelete = function ()
{
    if (audio) audio.pause();
    // TODO: We may need to delete this properly...
};

function handleVolumeChange()
{
    if (audio)
    {
        audio.volume = volume.get();
    }
}

play.onTriggered = startPlayback;
pause.onTriggered = pausePlayback;
rewind.onTriggered = rewindPlayback;
seekPosition.onChange = handleSeek;
jumpToSeekPosition.onTriggered = handleSeek;
file.onChange = handleFileChange;
volume.onChange = handleVolumeChange;
