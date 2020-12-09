function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

/* ports in */
const file = op.inUrl("File", "audio");
const volume = op.inFloatSlider("Volume", 1);
const inMute = op.inBool("Mute", false);
const play = op.inTriggerButton("Play");
const pause = op.inTriggerButton("Pause");
const rewind = op.inTriggerButton("Rewind");
const jumpToSeekPosition = op.inTriggerButton("Jump To Position");
const seekPosition = op.inFloat("Seek Position (Seconds)", 0);

op.setPortGroup("Volume Controls", [volume, inMute]);
op.setPortGroup("Playback Options", [play, pause, rewind]);
op.setPortGroup("Seek Options", [seekPosition, jumpToSeekPosition]);
/* ports out */
const duration = op.outNumber("Duration");
const outIsPlaying = op.outBool("Is Playing");
const outCurrentTime = op.outNumber("Current Time");

/* vars */
const audioContext = CABLES.WEBAUDIO.createAudioContext(op);
const gainNode = audioContext.createGain();
let audio = null;
let media = null;
let source = null;
let isPlaying = false;

let currentSeekPosition = 0;
let masterVolume = 1;

inMute.onChange = () =>
{
    if (inMute.get())
    {
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.01);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.06);
    }
    else
    {
        const level = Number(volume.get()) * masterVolume;
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(clamp(level, 0, 1), audioContext.currentTime + 0.01);
        if (level === 0) gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.06);
    }
};

function playbackEnded()
{
    isPlaying = false;
}

function rewindPlayback()
{
    if (audio)
    {
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.01);
        setTimeout(function ()
        {
            const level = !inMute.get() ? Number(volume.get()) * masterVolume : 0;
            gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(clamp(level, 0, 1), audioContext.currentTime + 0.01);
            audio.currentTime = 0;
        }, 30);
    }
}

function handleSeek()
{
    if (audio) { audio.currentTime = seekPosition.get(); }
}

function startPlayback()
{
    if (audio)
    {
        try
        {
            const level = !inMute.get() ? Number(volume.get()) * masterVolume : 0;
            audio.play();
            gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(clamp(level, 0.0, 1.0), audioContext.currentTime + 0.03);
            isPlaying = true;
        }
        catch (e)
        {
            op.log("error on start: ", e);
        }
    }
}

function pausePlayback()
{
    if (audio && !audio.paused)
    {
        try
        {
            gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.05);
            setTimeout(function ()
            {
                if (isPlaying)
                {
                    audio.pause();
                }
                isPlaying = false;
            }, 30);
        }
        catch (e)
        {
            op.log("error on pause: ", e);
        }
    }
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

    audio.addEventListener("play", () =>
    {
        outIsPlaying.set(true);
    });

    audio.addEventListener("pause", () =>
    {
        outIsPlaying.set(false);
    });

    audio.addEventListener("ended", () =>
    {
        outIsPlaying.set(false);
    });

    audio.addEventListener("timeupdate", () =>
    {
        outCurrentTime.set(audio.currentTime);
    });

    media.connect(gainNode);
    gainNode.connect(audioContext.destination);
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
    if (inMute.get()) return;
    if (audio)
    {
        const level = Number(volume.get()) * masterVolume;
        gainNode.gain.setValueAtTime(gainNode.gain.value, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(clamp(level, 0.0001, 1), audioContext.currentTime + 0.01);
        if (volume.get() === 0) gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.06);
    }
}

play.onTriggered = startPlayback;
pause.onTriggered = pausePlayback;
rewind.onTriggered = rewindPlayback;
seekPosition.onChange = () => { currentSeekPosition = Math.max(0, Number(seekPosition.get())); };
jumpToSeekPosition.onTriggered = handleSeek;
file.onChange = handleFileChange;
volume.onChange = handleVolumeChange;

op.onMasterVolumeChanged = (v) =>
{
    masterVolume = v;
    handleVolumeChange();
};
