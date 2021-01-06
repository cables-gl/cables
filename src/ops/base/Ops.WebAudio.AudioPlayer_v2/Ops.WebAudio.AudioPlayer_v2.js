const patch = this.patch;

this.file = op.inUrl("File", "audio");
const play = op.inBool("Play", false);
const autoPlay = op.inBool("Autoplay", false);

const volume = op.inFloatSlider("Volume", 1.0);
const synchronizedPlayer = op.inBool("Synchronized Player", false);

this.audioOut = this.addOutPort(new CABLES.Port(this, "Audio out", CABLES.OP_PORT_TYPE_OBJECT));
const outPlaying = this.addOutPort(new CABLES.Port(this, "Playing", CABLES.OP_PORT_TYPE_VALUE));
const outEnded = this.addOutPort(new CABLES.Port(this, "Ended", CABLES.OP_PORT_TYPE_FUNCTION));

const doLoop = op.inBool("Loop", false);

autoPlay.set(true);

outPlaying.ignoreValueSerialize = true;
outEnded.ignoreValueSerialize = true;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
if (!window.audioContext) window.audioContext = new AudioContext();

if (!window.audioContext)
{
    if (this.patch.config.onError) this.patch.config.onError("sorry, could not initialize WebAudio. Please check if your Browser supports WebAudio");
}

this.filter = audioContext.createGain();
this.audio = null;
let buffer = null;
let playing = false;
outPlaying.set(false);


play.onChange = function ()
{
    if (!this.audio)
    {
        op.uiAttr({ "error": "No audio file selected" });
        return;
    }
    else op.uiAttr({ "error": null });


    if (play.get())
    {
        playing = true;
        const prom = this.audio.play();
        if (prom instanceof Promise)
            prom.then(null, function (e) {});
    }
    else
    {
        playing = false;
        this.audio.pause();
    }
    outPlaying.set(playing);
};


this.onDelete = function ()
{
    if (this.audio) this.audio.pause();
};


doLoop.onChange = function ()
{
    if (this.audio) this.audio.loop = doLoop.get();
    else if (this.media) this.media.loop = doLoop.get();
};

function seek()
{
    if (!synchronizedPlayer.get())
    {
        if (!this.audio) return;

        let prom;
        if (this.patch.timer.isPlaying() && this.audio.paused) prom = this.audio.play();
        else if (!this.patch.timer.isPlaying() && !this.audio.paused) prom = this.audio.pause();

        if (prom instanceof Promise)
            prom.then(null, function (e) {});

        this.audio.currentTime = this.patch.timer.getTime();
    }
    else
    {
        if (buffer === null) return;

        const t = this.patch.timer.getTime();
        if (!isFinite(t))
        {
            return;
        }

        playing = false;

        if (this.patch.timer.isPlaying())
        {
            op.log("play!");
            outPlaying.set(true);

            this.media.start(t);
            playing = true;
        }
    }
}

function playPause()
{
    if (!this.audio) return;

    let prom;
    if (this.patch.timer.isPlaying()) prom = this.audio.play();
    else prom = this.audio.pause();
    if (prom instanceof Promise)
        prom.then(null, function (e) {});
}

function updateVolume()
{
    this.filter.gain.setValueAtTime((volume.get() || 0) * op.patch.config.masterVolume, window.audioContext.currentTime);
}

volume.onChange = updateVolume;
op.onMasterVolumeChanged = updateVolume;

const firstTime = true;
let loadingFilename = "";
this.file.onChange = function ()
{
    if (!this.file.get()) return;
    loadingFilename = op.patch.getFilePath(this.file.get());

    const loadingId = patch.loading.start("audioplayer", this.file.get());


    if (!synchronizedPlayer.get())
    {
        if (this.audio)
        {
            this.audio.pause();
            outPlaying.set(false);
        }
        this.audio = new Audio();

        op.log("load audio", this.file.get());

        this.audio.crossOrigin = "anonymous";
        this.audio.src = op.patch.getFilePath(this.file.get());
        this.audio.loop = doLoop.get();
        this.audio.crossOrigin = "anonymous";

        const canplaythrough = function ()
        {
            if (autoPlay.get() || play.get())
            {
                const prom = this.audio.play();
                if (prom instanceof Promise)
                    prom.then(null, function (e) {});
            }
            outPlaying.set(true);
            patch.loading.finished(loadingId);
            this.audio.removeEventListener("canplaythrough", canplaythrough, false);
        };

        this.audio.addEventListener("stalled", (err) => { op.log("mediaplayer stalled...", err); patch.loading.finished(loadingId); });
        this.audio.addEventListener("error", (err) => { op.log("mediaplayer error...", err); patch.loading.finished(loadingId); });
        this.audio.addEventListener("abort", (err) => { op.log("mediaplayer abort...", err); patch.loading.finished(loadingId); });
        this.audio.addEventListener("suspend", (err) => { op.log("mediaplayer suspend...", err); patch.loading.finished(loadingId); });


        this.audio.addEventListener("canplaythrough", canplaythrough, false);

        this.audio.addEventListener("ended", function ()
        {
            outPlaying.set(false);
            playing = false;
            outEnded.trigger();
        }, false);


        this.media = audioContext.createMediaElementSource(this.audio);
        this.media.connect(this.filter);
        this.audioOut.val = this.filter;
    }
    else
    {
        this.media = audioContext.createBufferSource();
        this.media.loop = doLoop.get();

        const request = new XMLHttpRequest();

        request.open("GET", op.patch.getFilePath(this.file.get()), true);
        request.responseType = "arraybuffer";

        request.onload = function ()
        {
            const audioData = request.response;

            audioContext.decodeAudioData(audioData, function (res)
            {
                buffer = res;
                this.media.buffer = res;
                this.media.connect(this.filter);
                this.audioOut.val = this.filter;
                this.media.loop = doLoop.get();

                patch.loading.finished(loadingId);
            });
        };

        request.send();

        this.patch.timer.onPlayPause(seek);
        this.patch.timer.onTimeChange(seek);
    }
};
