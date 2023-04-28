const
    fileName = op.inUrl("file", "audio"),
    inPlay = op.inValueBool("Play"),
    volume = op.inValueSlider("Volume"),

    doLoop = op.inValueBool("Loop"),
    outPlaying = op.outNumber("Playing"),
    outEle = op.outObject("Element", null, "element"),
    outEnded = op.outTrigger("Has Ended");

volume.set(1.0);
let audio = null;
let playing = false;
outPlaying.set(false);
volume.onChange = updateVolume;

function play()
{
    if (audio)
    {
        playing = true;
        audio.play();
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
        playing = false;
        if (audio) audio.pause();
    }
    outPlaying.set(playing);
};

this.onDelete = function ()
{
    if (audio) audio.pause();
};

doLoop.onChange = function ()
{
    if (audio) audio.loop = doLoop.get();
};

function playPause()
{
    if (!audio) return;

    if (op.patch.timer.isPlaying()) audio.play();
    else audio.pause();
}

function updateVolume()
{
    if (audio)audio.volume = volume.get() * op.patch.config.masterVolume;
}

op.onMasterVolumeChanged = updateVolume;

fileName.onChange = function ()
{
    if (!fileName.get()) return;

    let loadingId = op.patch.loading.start("audioplayer", fileName.get(), op);

    if (audio)
    {
        audio.pause();
        outPlaying.set(false);
    }
    audio = new Audio();
    audio.crossOrigin = "anonymous";
    audio.src = op.patch.getFilePath(fileName.get());
    audio.loop = doLoop.get();
    audio.controls = "true";
    audio.crossOrigin = "anonymous";

    outEle.set(audio);

    var canplaythrough = function ()
    {
        if (inPlay.get()) play();
        op.patch.loading.finished(loadingId);
        audio.removeEventListener("canplaythrough", canplaythrough, false);
    };

    audio.addEventListener("canplaythrough", canplaythrough, false);

    audio.addEventListener("ended", function ()
    {
        outPlaying.set(false);
        playing = false;
        outEnded.trigger();
        if (doLoop.get()) play();
    }, false);
};
