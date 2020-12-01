const audioIn = op.inObject("audio in");
const gain = op.inFloatSlider("gain", 1);
gain.onChange = updateGain;
const audioOut = op.outObject("audio out");

let audioContext = CABLES.WEBAUDIO.createAudioContext();
const gainNode = audioContext.createGain();

function updateGain()
{
    // gainNode.gain.value = parseFloat( gain.get() )||0;
    gainNode.gain.setValueAtTime(parseFloat(gain.get()) || 0, window.audioContext.currentTime);
}

let oldAudioIn = null;

audioIn.onChange = function ()
{
    if (!audioIn.get())
    {
        if (oldAudioIn)
        {
            try
            {
                if (oldAudioIn.disconnect) oldAudioIn.disconnect(gainNode);
            }
            catch (e)
            {
                console.log(e);
            }
        }
        op.setUiError("audioCtx", null);
    }
    else
    {
        if (audioIn.val.connect)
        {
            audioIn.val.connect(gainNode);
            op.setUiError("audioCtx", null);
        }
        else op.setUiError("audioCtx", "The passed input is not an audio context. Please make sure you connect an audio context to the input.", 2);
    }
    oldAudioIn = audioIn.get();
};

gain.set(1.0);
audioOut.set(gainNode);
