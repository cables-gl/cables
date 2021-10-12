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
const outVol = op.outNumber("Current Volume", 0);

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

        if (inAudio.get().connect) inAudio.get().connect(gainNode);
    }

    oldAudioIn = inAudio.get();

    if (!connectedToOut)
    {
        gainNode.connect(destinationNode);
        connectedToOut = true;
    }

    setVolume();
};

// functions
// sets the volume, multiplied by master volume
function setVolume(fromMute)
{
    const masterVolume = op.patch.config.masterVolume || 0;

    // console.log(op.patch._paused, op.patch.config.masterVolume, inGain.get());

    let volume = inGain.get() * masterVolume;

    if (op.patch._paused || inMute.get()) volume = 0;

    let addTime = 0.05;
    if (fromMute) addTime = 0.2;

    volume = clamp(volume, 0, 1);
    // console.log("volume", volume);
    gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + addTime);

    outVol.set(volume);
}

function mute(b)
{
    if (b)
    {
        if (audioCtx.state === "suspended")
        { // make sure that when audio context is suspended node will also be muted
            // this prevents the initial short sound burst being heard when context is suspended
            // and started from user interaction
            // also note, we have to cancle the already scheduled values as we have no influence over
            // the order in which onchange handlers are executed

            gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
            gainNode.gain.value = 0;
            gainNode.gain.setValueAtTime(0, audioCtx.currentTime);

            outVol.set(0);

            // * NOTE: we have to use both of the upper statements so it works in chrome & firefox
            return;
        }
    }

    setVolume(true);
}

// change listeners
inMute.onChange = () =>
{
    mute(inMute.get());
};

inGain.onChange = setVolume;
op.onMasterVolumeChanged = setVolume;

op.patch.on("pause", setVolume);
op.patch.on("resume", setVolume);

op.onDelete = () =>
{
    gainNode.disconnect();
    gainNode = null;
};
