const
    fileName = op.inUrl("file", "audio"),
    inPlay = op.inValueBool("Play"),
    volume = op.inValueSlider("Volume"),
    inTimeOffset = op.inFloat("Offset"),
    doLoop = op.inValueBool("Loop"),
    doRewind = op.inValueBool("Rewind on play", false),
    inPlayTrigg = op.inTriggerButton("Play Trigger"),
    inPauseTrigg = op.inTriggerButton("Pause"),
    inRewind = op.inTriggerButton("Rewind"),
    inActive = op.inBool("Active", true),
    outPlaying = op.outNumber("Playing"),
    outDuration = op.outNumber("Duration"),
    outCurrentTime = op.outNumber("Current Time"),
    outEle = op.outObject("Element", null, "element"),
    outEnded = op.outTrigger("Has Ended");

const timer = new CABLES.Timer();

volume.set(1.0);
let audio = null;
let playing = false;
let loadSoonTo = null;
outPlaying.set(false);
volume.onChange = updateVolume;

inPlayTrigg.onTriggered = play;
inPauseTrigg.onTriggered = pause;
op.onDelete = pause;
op.onMasterVolumeChanged = updateVolume;

inTimeOffset.onChange = () => { seek(inTimeOffset.get()); };
inRewind.onTriggered = rewind;

outPlaying.set(false);

fileName.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": CABLES.basename(fileName.get()) });
    loadSoon();
};

inActive.onChange = () =>
{
    if (!inActive.get())
    {
        pause();
        outDuration.set(0);
        audio = null;
    }
    else loadSoon();
};

function pause()
{
    if (audio)
    {
        timer.setTime(audio.currentTime);
        timer.pause();
        op.patch.removeOnAnimFrame(op);
        audio.pause();
    }
    playing = false;
    outPlaying.set(playing);
}

function play()
{
    if (!inActive.get()) return;
    if (audio && doRewind.get())
    {
        audio.currentTime = getWantedTime();
    }

    if (audio)
    {
        playing = true;
        timer.setTime(audio.currentTime);
        timer.play();
        op.patch.addOnAnimFrame(op);
        audio.play().catch((e) =>
        {
            console.log("err play");
        });
        outPlaying.set(playing);
    }
}

function rewind()
{
    seek(0.0);
}

function seek(goto)
{
    if (!audio) return;
    if (!goto) goto = getWantedTime();
    timer.setTime(goto);
    audio.currentTime = goto;
    outCurrentTime.set(audio.currentTime);
}

inPlay.onChange = function ()
{
    if (!inActive.get()) return;
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
    if (audio) audio.volume = CABLES.clamp(volume.get() * op.patch.config.masterVolume, 0, 1);
}

function getWantedTime()
{
    let goto = inTimeOffset.get();
    if (!goto || goto < 0) goto = 0;
    return goto;
}

function loadSoon()
{
    clearTimeout(loadSoonTo);
    loadSoonTo = setTimeout(load, 100);
}

function load()
{
    if (!inActive.get()) return;
    if (!fileName.get()) return;

    let loadingId = op.patch.loading.start("audioplayer", fileName.get(), op);

    if (audio)
    {
        pause();
    }

    outDuration.set(0);
    audio = new Audio();
    audio.src = op.patch.getFilePath(fileName.get());
    audio.loop = doLoop.get();
    audio.controls = "true";
    audio.crossOrigin = "anonymous";
    updateVolume();

    audio.currentTime = getWantedTime();

    outEle.set(audio);

    let canplaythrough = () =>
    {
        if (audio) outDuration.set(audio.duration);
        if (inPlay.get()) play();
        if (audio) audio.removeEventListener("canplaythrough", canplaythrough, false);
    };
    op.patch.loading.finished(loadingId);

    audio.addEventListener("canplaythrough", canplaythrough, false);

    // const timeupdate = () =>
    // {
    //     if (audio)timer.setTime(audio.currentTime);
    //     // outCurrentTime.set(audio.currentTime);
    // };
    audio.addEventListener("error", function (e)
    {
        console.log("error", e);
    });
    audio.onerror = (event) =>
    {
        console.log(fileName.get(), op.id);
        console.log("onerror", event);
    };
    audio.abort = (event) =>
    {
        console.log("abort", event);
    };
    // audio.addEventListener("timeupdate", timeupdate);

    audio.addEventListener("ended", function ()
    {
        // pause();
        outEnded.trigger();
        outPlaying.set(false);
        timer.pause();
        console.log("ENDED");
        // if (doLoop.get()) play();
    }, false);
}

op.onAnimFrame = (tt, frameNum, deltaMs) =>
{
    if (timer.isPlaying())
    {
        timer.update();
        const time = timer.get();
        outCurrentTime.set(time);
    }
};
