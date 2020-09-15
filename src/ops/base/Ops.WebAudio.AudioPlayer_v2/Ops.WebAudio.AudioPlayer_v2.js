const self = this;
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
self.audio = null;
let buffer = null;
let playing = false;
outPlaying.set(false);


play.onChange = function ()
{
    if (!self.audio)
    {
        op.uiAttr({ "error": "No audio file selected" });
        return;
    }
    else op.uiAttr({ "error": null });


    if (play.get())
    {
        playing = true;
        const prom = self.audio.play();
        if (prom instanceof Promise)
            prom.then(null, function (e) {});
    }
    else
    {
        playing = false;
        self.audio.pause();
    }
    outPlaying.set(playing);
};


this.onDelete = function ()
{
    if (self.audio) self.audio.pause();
};


doLoop.onChange = function ()
{
    if (self.audio) self.audio.loop = doLoop.get();
    else if (self.media) self.media.loop = doLoop.get();
};

function seek()
{
    // if(!window.gui && CGL.getLoadingStatus()>=1.0)
    // {
    //     console.log('seek canceled',CGL.getLoadingStatus());
    //     return;
    // }

    if (!synchronizedPlayer.get())
    {
        if (!self.audio) return;

        let prom;
        if (self.patch.timer.isPlaying() && self.audio.paused) prom = self.audio.play();
        else if (!self.patch.timer.isPlaying() && !self.audio.paused) prom = self.audio.pause();

        if (prom instanceof Promise)
            prom.then(null, function (e) {});

        self.audio.currentTime = self.patch.timer.getTime();
    }
    else
    {
        if (buffer === null) return;

        const t = self.patch.timer.getTime();
        if (!isFinite(t))
        {
            return;
            // console.log('not finite time...',t);
            // t=0.0;
        }

        playing = false;

        // console.log('seek.....',self.patch.timer.isPlaying());

        if (self.patch.timer.isPlaying())
        {
            console.log("play!");
            outPlaying.set(true);

            self.media.start(t);
            playing = true;
        }
    }
}

function playPause()
{
    if (!self.audio) return;

    let prom;
    if (self.patch.timer.isPlaying()) prom = self.audio.play();
    else prom = self.audio.pause();
    if (prom instanceof Promise)
        prom.then(null, function (e) {});
}

function updateVolume()
{
    // self.filter.gain.value=(volume.get() || 0)*op.patch.config.masterVolume;
    self.filter.gain.setValueAtTime((volume.get() || 0) * op.patch.config.masterVolume, window.audioContext.currentTime);
}

volume.onChange = updateVolume;
op.onMasterVolumeChanged = updateVolume;

const firstTime = true;
let loadingFilename = "";
this.file.onChange = function ()
{
    if (!self.file.get()) return;
    loadingFilename = op.patch.getFilePath(self.file.get());

    const loadingId = patch.loading.start("audioplayer", self.file.get());


    if (!synchronizedPlayer.get())
    {
        if (self.audio)
        {
            self.audio.pause();
            outPlaying.set(false);
        }
        self.audio = new Audio();

        console.log("load audio", self.file.get());

        self.audio.crossOrigin = "anonymous";
        self.audio.src = op.patch.getFilePath(self.file.get());
        self.audio.loop = doLoop.get();
        self.audio.crossOrigin = "anonymous";

        var canplaythrough = function ()
        {
            if (autoPlay.get() || play.get())
            {
                const prom = self.audio.play();
                if (prom instanceof Promise)
                    prom.then(null, function (e) {});
            }
            outPlaying.set(true);
            patch.loading.finished(loadingId);
            self.audio.removeEventListener("canplaythrough", canplaythrough, false);
        };

        self.audio.addEventListener("stalled", (err) => { console.log("mediaplayer stalled...", err); patch.loading.finished(loadingId); });
        self.audio.addEventListener("error", (err) => { console.log("mediaplayer error...", err); patch.loading.finished(loadingId); });
        self.audio.addEventListener("abort", (err) => { console.log("mediaplayer abort...", err); patch.loading.finished(loadingId); });
        self.audio.addEventListener("suspend", (err) => { console.log("mediaplayer suspend...", err); patch.loading.finished(loadingId); });


        self.audio.addEventListener("canplaythrough", canplaythrough, false);

        self.audio.addEventListener("ended", function ()
        {
            // console.log('audio player ended...');
            outPlaying.set(false);
            playing = false;
            outEnded.trigger();
        }, false);


        self.media = audioContext.createMediaElementSource(self.audio);
        self.media.connect(self.filter);
        self.audioOut.val = self.filter;
    }
    else
    {
        self.media = audioContext.createBufferSource();
        self.media.loop = doLoop.get();

        const request = new XMLHttpRequest();

        request.open("GET", op.patch.getFilePath(self.file.get()), true);
        request.responseType = "arraybuffer";

        request.onload = function ()
        {
            const audioData = request.response;

            audioContext.decodeAudioData(audioData, function (res)
            {
                buffer = res;
                // console.log('sound load complete');
                self.media.buffer = res;
                self.media.connect(self.filter);
                self.audioOut.val = self.filter;
                self.media.loop = doLoop.get();

                patch.loading.finished(loadingId);

                // if(!window.gui)
                // {
                //     self.media.start(0);
                //     playing=true;
                // }
            });
        };

        request.send();

        self.patch.timer.onPlayPause(seek);
        self.patch.timer.onTimeChange(seek);
    }
};
