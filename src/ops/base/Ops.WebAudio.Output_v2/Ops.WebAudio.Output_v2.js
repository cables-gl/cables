const
    inAudio = op.inObject("Audio In", null, "audioNode"),
    inGain = op.inFloatSlider("Volume", 1),
    inMute = op.inBool("Mute", false),
    inShowSusp = op.inBool("Show Audio Suspended Button", true),
    outVol = op.outNumber("Current Volume", 0),
    outChannels = op.outNumber("Number Of Channels"),
    outState = op.outString("Context State", "unknown");

op.setPortGroup("Volume Settings", [inMute, inGain]);

let isSuspended = false;
let audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
let gainNode = audioCtx.createGain();
const destinationNode = audioCtx.destination;
let oldAudioIn = null;
let connectedToOut = false;

inMute.onChange = () =>
{
    mute(inMute.get());
    updateStateError();
};

inGain.onChange = setVolume;
op.onMasterVolumeChanged = setVolume;

let pauseId = op.patch.on("pause", setVolume);
let resumeId = op.patch.on("resume", setVolume);

audioCtx.addEventListener("statechange", updateStateError);
inShowSusp.onChange = updateAudioStateButton;

updateStateError();
updateAudioStateButton();

op.onDelete = () =>
{
    if (gainNode) gainNode.disconnect();
    gainNode = null;
    if (CABLES.interActionNeededButton) CABLES.interActionNeededButton.remove("audiosuspended");
    if (pauseId) op.patch.off(pauseId);
    if (resumeId) op.patch.off(resumeId);
};

inAudio.onChange = function ()
{
    op.setUiError("multipleInputs", null);
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
            op.logError(e);
        }
    }

    if (connectedToOut)
    {
        if (gainNode)
        {
            gainNode.disconnect(destinationNode);
        }
        connectedToOut = false;
    }

    if (inAudio.get())
    {
        if (inAudio.links.length > 1) op.setUiError("multipleInputs", "You have connected multiple inputs. It is possible that you experience unexpected behaviour. Please use a Mixer op to connect multiple audio streams.", 1);
        else op.setUiError("multipleInputs", null);

        if (inAudio.get().connect)
        {
            inAudio.get().connect(gainNode);
        }
    }

    oldAudioIn = inAudio.get();

    if (!connectedToOut)
    {
        if (gainNode)
        {
            gainNode.connect(destinationNode);
        }
        connectedToOut = true;
    }

    if (audioCtx && audioCtx.destination)
    {
        outChannels.set(audioCtx.destination.maxChannelCount);
    }
    else
    {
        outChannels.set(0);
    }

    setVolume();
};

function setVolume()
{
    const masterVolume = op.patch.config.masterVolume || 0;

    let volume = inGain.get() * masterVolume;
    if (op.patch._paused || inMute.get()) volume = 0;
    volume = CABLES.clamp(volume, 0, 1);

    if (!gainNode) op.logError("gainNode undefined");
    if (gainNode) gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + 0.05);

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
            // also note, we have to cancel the already scheduled values as we have no influence over
            // the order in which onchange handlers are executed

            if (gainNode)
            {
                gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
                gainNode.gain.value = 0;
                gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
            }

            outVol.set(0);

            return;
        }
    }

    setVolume();
}

function updateStateError()
{
    outState.set(audioCtx.state);
    op.logVerbose("audioCtx.state change", audioCtx.state);

    op.setUiError("ctxSusp", null);
    if (audioCtx.state == "suspended")
    {
        const errorText = "Your Browser suspended audio context, use playButton op to play audio after a user interaction";
        let level = 1;
        if (inMute.get()) level = 0;
        op.setUiError("ctxSusp", errorText, level);
    }

    updateAudioStateButton();
}

function updateAudioStateButton()
{
    if (audioCtx.state == "suspended")
    {
        mute(true);
        if (inShowSusp.get())
        {
            isSuspended = true;

            if (CABLES.interActionNeededButton)
            {
                CABLES.interActionNeededButton.add(op.patch, "audiosuspended", () =>
                {
                    if (audioCtx && audioCtx.state == "suspended")
                    {
                        audioCtx.resume();
                        if (CABLES.interActionNeededButton)CABLES.interActionNeededButton.remove("audiosuspended");
                    }
                });
            }
        }
        else
        {
            if (CABLES.interActionNeededButton)CABLES.interActionNeededButton.remove("audiosuspended");
        }
    }
    else
    {
        if (CABLES.interActionNeededButton)CABLES.interActionNeededButton.remove("audiosuspended");

        if (isSuspended)
        {
            op.log("was suspended - set vol");
            setVolume();
        }
    }
}
