op.requirements = [CABLES.Requirements.WEBAUDIO];

let isSuspended = false;
let audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
let gainNode = audioCtx.createGain();
const destinationNode = audioCtx.destination;

const
    inAudio = op.inObject("Audio In", null, "audioNode"),
    inGain = op.inFloatSlider("Volume", 1),
    inMute = op.inBool("Mute", false),
    inShowSusp = op.inBool("Show Audio Suspended Button", true),
    outVol = op.outNumber("Current Volume", 0),
    outState = op.outString("Context State", "unknown");

op.setPortGroup("Volume Settings", [inMute, inGain]);

let oldAudioIn = null;
let connectedToOut = false;
let fsElement = null;

inMute.onChange = () =>
{
    mute(inMute.get());
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
    if (fsElement) fsElement.remove();
    if (pauseId) op.patch.off(pauseId);
    if (resumeId) op.patch.off(resumeId);
};

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
                op.logError(e);
            }
        }

        op.setUiError("multipleInputs", null);

        if (connectedToOut)
        {
            if (gainNode)gainNode.disconnect(destinationNode);
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
        if (gainNode)gainNode.connect(destinationNode);
        connectedToOut = true;
    }

    setVolume();
};

function setVolume(fromMute)
{
    const masterVolume = op.patch.config.masterVolume || 0;

    let volume = inGain.get() * masterVolume;

    if (op.patch._paused || inMute.get()) volume = 0;

    let addTime = 0.05;
    if (fromMute) addTime = 0.2;

    volume = CABLES.clamp(volume, 0, 1);

    if (!gainNode)
        op.logError("gainNode undefined");

    if (gainNode) gainNode.gain.linearRampToValueAtTime(volume, audioCtx.currentTime + addTime);

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

    setVolume(true);
}

function updateStateError()
{
    outState.set(audioCtx.state);
    op.logVerbose("audioCtx.state change", audioCtx.state);

    if (audioCtx.state == "suspended") op.setUiError("ctxSusp", "Your Browser suspended audio context, use playButton op to play audio after a user interaction");
    else op.setUiError("ctxSusp", null);

    updateAudioStateButton();
}

function updateAudioStateButton()
{
    if (!inShowSusp.get() && fsElement)
    {
        fsElement.remove();
        fsElement = null;
    }

    if (audioCtx.state == "suspended")
    {
        mute(true);
        if (inShowSusp.get())
        {
            isSuspended = true;
            if (!fsElement)
            {
                fsElement = document.createElement("div");

                const container = op.patch.cgl.canvas.parentElement;
                if (container)container.appendChild(fsElement);

                fsElement.addEventListener("pointerdown", function (e)
                {
                    if (audioCtx && audioCtx.state == "suspended")
                    {
                        audioCtx.resume();
                    }
                });
            }

            fsElement.style.padding = "10px";
            fsElement.style.position = "absolute";
            fsElement.style.right = "20px";
            fsElement.style.bottom = "20px";
            fsElement.style.width = "24px";
            fsElement.style.height = "24px";
            fsElement.style.cursor = "pointer";
            fsElement.style["border-radius"] = "40px";
            fsElement.style.background = "#444";
            fsElement.style["z-index"] = "9999";
            fsElement.style.display = "block";
            fsElement.dataset.opid = op.id;
            fsElement.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" class=\"feather feather-volume-2\"><polygon points=\"11 5 6 9 2 9 2 15 6 15 11 19 11 5\"></polygon><path d=\"M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07\"></path></svg>";
        }
    }
    else
    {
        if (fsElement) fsElement.remove();
        fsElement = null;

        if (isSuspended)
        {
            op.log("was suspended - set vol");
            setVolume(true);
        }
    }
}
