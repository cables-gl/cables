const
    fileName = op.inUrl("file", "audio"),
    inPlay = op.inValueBool("Play"),
    volume = op.inValueSlider("Volume"),
    inTime = op.inFloat("Time"),
    doLoop = op.inValueBool("Loop"),
    doRewind = op.inValueBool("Rewind on play", false),
    inPlayTrigg = op.inTriggerButton("Play Trigger"),
    inPauseTrigg = op.inTriggerButton("Pause"),
    inRewind = op.inTriggerButton("Rewind"),
    outPlaying = op.outNumber("Playing"),
    outDuration = op.outNumber("Duration"),
    outCurrentTime = op.outNumber("Current Time"),
    outEle = op.outObject("Element", null, "element"),
    outEnded = op.outTrigger("Has Ended");

volume.set(1.0);
let audio = null;
let playing = false;
outPlaying.set(false);
volume.onChange = updateVolume;

inPlayTrigg.onTriggered = play;
inPauseTrigg.onTriggered = pause;
op.onDelete = pause;
op.onMasterVolumeChanged = updateVolume;

inTime.onChange = () => { updateTime(inTime.get()); };
inRewind.onTriggered = rewind;

function pause()
{
    if (audio) audio.pause();
    playing = false;
    outPlaying.set(playing);
}

function play()
{
    if (doRewind.get())audio.currentTime = 0;

    if (audio)
    {
        playing = true;
        audio.play();
        outPlaying.set(playing);
    }
}

inPlay.onChange = function ()
{
    if (inPlay.get())
    {
        play();
    }
    else
    {
        pause();
    }
};

doLoop.onChange = function ()
{
    if (audio) audio.loop = doLoop.get();
};

function updateVolume()
{
    if (audio)audio.volume = CABLES.clamp(volume.get() * op.patch.config.masterVolume, 0, 1);
}

function updateTime(goto)
{
    if (!audio) return;
    if (!goto)
    {
        goto = getWantedTime();
    }
    audio.fastSeek(goto);
}

function rewind()
{
    updateTime(0.0);
}

function getWantedTime()
{
    let goto = inTime.get();
    if (!goto || goto < 0) goto = 0;
    return goto;
}

fileName.onChange = function ()
{
    if (!fileName.get()) return;

    let loadingId = op.patch.loading.start("audioplayer", fileName.get(), op);

    if (audio)
    {
        audio.pause();
        outPlaying.set(false);
    }

    outDuration.set(0);
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = op.patch.getFilePath(fileName.get());
    audio.loop = doLoop.get();
    audio.controls = "true";
    audio.crossOrigin = "anonymous";
    audio.currentTime = getWantedTime();

    outEle.set(audio);

    var canplaythrough = () =>
    {
        outDuration.set(audio.duration);
        if (inPlay.get()) play();
        op.patch.loading.finished(loadingId);
        audio.removeEventListener("canplaythrough", canplaythrough, false);
    };

    audio.addEventListener("canplaythrough", canplaythrough, false);

    const timeupdate = () =>
    {
        outCurrentTime.set(audio.currentTime);
    };

    audio.addEventListener("timeupdate", timeupdate);

    audio.addEventListener("ended", function ()
    {
        outPlaying.set(false);
        playing = false;
        outEnded.trigger();
        if (doLoop.get()) play();
    }, false);
};
