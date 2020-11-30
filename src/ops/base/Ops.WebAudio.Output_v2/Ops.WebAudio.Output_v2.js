function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

op.requirements = [CABLES.Requirements.WEBAUDIO];

let audioCtx = null;
if (!window.audioContext) { audioCtx = new AudioContext(); }
else audioCtx = window.audioContext;

// vars
const gainNode = audioCtx.createGain();
const destinationNode = audioCtx.destination;


// inputs
const inAudio = op.inObject("Audio In");
const inGain = op.inFloatSlider("Volume", 1);
const inMute = op.inBool("Mute", false);

op.setPortGroup("Volume Settings", [inMute, inGain]);

let masterVolume = 1;
let oldAudioIn = null;
let connectedToOut = false;

inAudio.onChange = function ()
{
    if (!inAudio.get())
    {
        if (oldAudioIn)
        {
            try
            {
                if (oldAudioIn.disconnect) {
                        oldAudioIn.disconnect(gainNode);
                }
            }
            catch (e)
            {
                op.log(e);
            }
        }
        op.setUiError("audioCtx", null);
        if (connectedToOut) {
            gainNode.disconnect(destinationNode);
            connectedToOut = false;
        }

    }
    else
    {
        if (inAudio.val.connect)
        {
            inAudio.val.connect(gainNode);
            op.setUiError("audioCtx", null);
        }
        else op.setUiError("audioCtx", "The passed input is not an audio context. Please make sure you connect an audio context to the input.", 2);
    }
    oldAudioIn = inAudio.get();

    if (!connectedToOut) {
        gainNode.connect(destinationNode);
        connectedToOut = true;
    }
};

// functions
// sets the volume, multiplied by master volume
function setVolume() {
    var volume = inGain.get() * masterVolume;
        gainNode.gain.setValueAtTime(clamp(volume, 0, 1), audioCtx.currentTime);
}

function mute(b) {
    if(b) {
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    } else {
        setVolume();
    }
}

// change listeners
inMute.onChange = () => {
    mute(inMute.get());
};

inGain.onChange = () => {
    if(inMute.get()) {
        return;
    }
    setVolume();
};

op.onMasterVolumeChanged = (v) => {
    masterVolume = v;
    setVolume();
};


