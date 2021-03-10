function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

op.requirements = [CABLES.Requirements.WEBAUDIO];

let audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

// vars
let gainNode = audioCtx.createGain();
const destinationNode = audioCtx.destination;

// inputs
const inAudio = op.inObject("Audio In");
const inGain = op.inFloatSlider("Volume", 1);
const inMute = op.inBool("Mute", false);

op.setPortGroup("Volume Settings", [inMute, inGain]);

let masterVolume = 1;
let oldAudioIn = null;
let connectedToOut = false;

if (inMute.get())
{
    gainNode.gain.value = 0;
}

inAudio.onChange = function ()
{
    if (!inAudio.get())
    {
        if (oldAudioIn)
        {
            try
            {
                if (oldAudioIn.disconnect)
                {
                    oldAudioIn.disconnect(gainNode);
                }
            }
            catch (e)
            {
                op.log(e);
            }
        }
        op.setUiError("audioCtx", null);
        op.setUiError("multipleInputs", null);

        if (connectedToOut)
        {
            gainNode.disconnect(destinationNode);
            connectedToOut = false;
        }
    }
    else
    {
        if (inAudio.links.length > 1) op.setUiError("multipleInputs", "You have connected multiple inputs. It is possible that you experience unexpected behaviour. Please use a Mixer op to connect multiple audio streams.", 1);
        else op.setUiError("multipleInputs", null);
        if (inAudio.val.connect)
        {
            inAudio.val.connect(gainNode);
            op.setUiError("audioCtx", null);
        }
        else op.setUiError("audioCtx", "The passed input is not an audio context. Please make sure you connect an audio context to the input.", 2);
    }
    oldAudioIn = inAudio.get();

    if (!connectedToOut)
    {
        gainNode.connect(destinationNode);
        connectedToOut = true;
    }
};

// functions
// sets the volume, multiplied by master volume
function setVolume(fromMute)
{
    let volume = inGain.get() * masterVolume;
    volume = clamp(volume, 0, 1);
    if (inMute.get()) volume = 0;

    if (!fromMute)
    {
        if (gainNode) gainNode.gain.linearRampToValueAtTime(clamp(volume, 0, 1), audioCtx.currentTime + 0.05);
    }
    else
    {
        if (gainNode) gainNode.gain.linearRampToValueAtTime(clamp(volume, 0, 1), audioCtx.currentTime + 0.2);
    }
}

function mute(b)
{
    if (b)
    {
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
    }
    else
    {
        setVolume(true);
    }
}

// change listeners
inMute.onChange = () =>
{
    mute(inMute.get());
};

inGain.onChange = () =>
{
    if (inMute.get())
    {
        return;
    }
    setVolume();
};

op.patch.on("pause", () =>
{
    if (inMute.get()) return;
    masterVolume = 0;
    setVolume();
});

op.patch.on("resume", () =>
{
    if (op.patch.config.masterVolume !== 0) masterVolume = op.patch.config.masterVolume;
    else masterVolume = 0;
    setVolume();
});

op.onMasterVolumeChanged = (v) =>
{
    if (op.patch._paused) masterVolume = 0;
    else masterVolume = v;
    setVolume();
};

op.onDelete = () =>
{
    gainNode.disconnect();
    gainNode = null;
};
