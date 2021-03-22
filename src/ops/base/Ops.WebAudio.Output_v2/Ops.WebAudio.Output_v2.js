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
const inAudio = op.inObject("Audio In", null, "audioNode");
const inGain = op.inFloatSlider("Volume", 1);
const inMute = op.inBool("Mute", false);

op.setPortGroup("Volume Settings", [inMute, inGain]);
op.log("OUTPUT - initstate", inMute.get(), audioCtx.state);

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

        if (inAudio.val.connect) inAudio.val.connect(gainNode);
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
        op.log("from mute setVolume", gainNode.gain.value);
    }
    else
    {
        if (gainNode)
        {
            op.log("not from mute setVolume", gainNode.gain.value);
            gainNode.gain.linearRampToValueAtTime(clamp(volume, 0, 1), audioCtx.currentTime + 0.2);
        }
    }
    op.log("OUTPUT - after setVolume", inMute.get(), audioCtx.state, volume, fromMute);
}

function mute(b)
{
    op.log("OUTPUT - called mute", "should be muted?", b, inMute.get(), "currentState:", audioCtx.state);
    if (b)
    {
        if (audioCtx.state === "suspended")
        { // make sure that when audio context is suspended node will also be muted
            // this prevents the initial short sound burst being heard when context is suspended
            // and started from user interaction

            gainNode.gain.value = 0;
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            op.log("OUTPUT - ctx.state: suspended", inMute.get(), audioCtx.state, gainNode.gain);
            setInterval(() =>
            {
                // op.log("OUTPUT - gain", inMute.get(), audioCtx.state, gainNode.gain);
            }, 200);

            // * NOTE: we have to use both of the upper statements so it works in chrome & firefox
            return;
        }

        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.2);
        op.log("After normal mute", gainNode.gain.value);
    }
    else
    {
        op.log("Mute is false, setting volume:", gainNode.gain.value);
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
        op.log("OUTPUT - returning from inGain.onChange", gainNode.gain.value);
        return;
    }
    op.log("OUTPUT - Call setVolume from inGain.onChange", inGain.get(), inMute.get());
    setVolume();
};

op.patch.on("pause", () =>
{
    op.log("OUTPUT - pause", inMute.get());
    if (inMute.get()) return;
    masterVolume = 0;
    setVolume();
});

op.patch.on("resume", () =>
{
    op.log("OUTPUT - resume", inMute.get());
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
