const patch = this.patch;

const file = op.inUrl("File", "audio");
const play = op.inBool("Play", false);
const autoPlay = op.inBool("Autoplay", false);

const volume = op.inFloatSlider("Volume", 1.0);
const synchronizedPlayer = op.inBool("Synchronized Player", false);

const audioOut = op.addOutPort(new CABLES.Port(op, "Audio out", CABLES.OP_PORT_TYPE_OBJECT));
const outPlaying = op.addOutPort(new CABLES.Port(op, "Playing", CABLES.OP_PORT_TYPE_VALUE));
const outEnded = op.addOutPort(new CABLES.Port(op, "Ended", CABLES.OP_PORT_TYPE_FUNCTION));

const doLoop = op.inBool("Loop", false);

autoPlay.set(true);

outPlaying.ignoreValueSerialize = true;
outEnded.ignoreValueSerialize = true;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
if (!window.audioContext) window.audioContext = new AudioContext();

if (!window.audioContext)
{
    if (patch.config.onError) patch.config.onError("sorry, could not initialize WebAudio. Please check if your Browser supports WebAudio");
}

let filter = audioContext.createGain();
let audio = null;
let buffer = null;
let playing = false;
let media = null;
outPlaying.set(false);

play.onChange = function ()
{
    if (!audio)
    {
        op.uiAttr({ "error": "No audio file selected" });
        return;
    }
    else op.uiAttr({ "error": null });

    if (play.get())
    {
        playing = true;
        const prom = audio.play();
        if (prom instanceof Promise)
            prom.then(null, function (e) {});
    }
    else
    {
        playing = false;
        audio.pause();
    }
    outPlaying.set(playing);
};

const onDelete = function ()
{
    if (audio) audio.pause();
};

doLoop.onChange = function ()
{
    if (audio) audio.loop = doLoop.get();
    else if (media) media.loop = doLoop.get();
};

function seek()
{
    if (!synchronizedPlayer.get())
    {
        if (!audio) return;

        let prom;
        if (patch.timer.isPlaying() && audio.paused) prom = audio.play();
        else if (!patch.timer.isPlaying() && !audio.paused) prom = audio.pause();

        if (prom instanceof Promise)
            prom.then(null, function (e) {});

        audio.currentTime = patch.timer.getTime();
    }
    else
    {
        if (buffer === null) return;

        const t = patch.timer.getTime();
        if (!isFinite(t))
        {
            return;
        }

        playing = false;

        if (patch.timer.isPlaying())
        {
            op.log("play!");
            outPlaying.set(true);

            media.start(t);
            playing = true;
        }
    }
}

function playPause()
{
    if (!audio) return;

    let prom;
    if (patch.timer.isPlaying()) prom = audio.play();
    else prom = audio.pause();
    if (prom instanceof Promise)
        prom.then(null, function (e) {});
}

function updateVolume()
{
    filter.gain.setValueAtTime((volume.get() || 0) * op.patch.config.masterVolume, window.audioContext.currentTime);
}

volume.onChange = updateVolume;
op.onMasterVolumeChanged = updateVolume;

const firstTime = true;
let loadingFilename = "";
file.onChange = function ()
{
    if (!file.get()) return;
    loadingFilename = op.patch.getFilePath(file.get());

    const loadingId = patch.loading.start("audioplayer", file.get());

    if (!synchronizedPlayer.get())
    {
        if (audio)
        {
            audio.pause();
            outPlaying.set(false);
        }
        audio = new Audio();

        op.log("load audio", file.get());

        audio.crossOrigin = "anonymous";
        audio.src = op.patch.getFilePath(file.get());
        audio.loop = doLoop.get();
        audio.crossOrigin = "anonymous";

        const canplaythrough = function ()
        {
            if (autoPlay.get() || play.get())
            {
                const prom = audio.play();
                if (prom instanceof Promise)
                    prom.then(null, function (e) {});
            }
            outPlaying.set(true);
            patch.loading.finished(loadingId);
            audio.removeEventListener("canplaythrough", canplaythrough, false);
        };

        audio.addEventListener("stalled", (err) => { op.log("mediaplayer stalled...", err); patch.loading.finished(loadingId); });
        audio.addEventListener("error", (err) => { op.log("mediaplayer error...", err); patch.loading.finished(loadingId); });
        audio.addEventListener("abort", (err) => { op.log("mediaplayer abort...", err); patch.loading.finished(loadingId); });
        audio.addEventListener("suspend", (err) => { op.log("mediaplayer suspend...", err); patch.loading.finished(loadingId); });

        audio.addEventListener("canplaythrough", canplaythrough, false);

        audio.addEventListener("ended", function ()
        {
            outPlaying.set(false);
            playing = false;
            outEnded.trigger();
        }, false);

        media = audioContext.createMediaElementSource(audio);
        media.connect(filter);
        audioOut.set(filter);
    }
    else
    {
        media = audioContext.createBufferSource();
        media.loop = doLoop.get();

        const request = new XMLHttpRequest();

        request.open("GET", op.patch.getFilePath(file.get()), true);
        request.responseType = "arraybuffer";

        request.onload = function ()
        {
            const audioData = request.response;

            audioContext.decodeAudioData(audioData, function (res)
            {
                buffer = res;
                media.buffer = res;
                media.connect(filter);
                audioOut.set(filter);
                media.loop = doLoop.get();

                patch.loading.finished(loadingId);
            });
        };

        request.send();

        patch.timer.on("playPause", seek);
        patch.timer.on("timeChange", seek);
    }
};
