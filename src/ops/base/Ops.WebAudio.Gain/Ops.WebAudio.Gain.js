const audioIn = op.inObject("audio in");
const gain = op.inFloatSlider("gain", 1);
const inMute = op.inBool("Mute", false);
const audioOut = op.outObject("audio out");

let audioContext = CABLES.WEBAUDIO.createAudioContext(op);
const gainNode = audioContext.createGain();

gain.onChange = () =>
{
    if (inMute.get()) return;
    // gainNode.gain.value = parseFloat( gain.get() )||0;
    gainNode.gain.setValueAtTime(Number(gain.get()) || 0, window.audioContext.currentTime);
};

inMute.onChange = () =>
{
    if (inMute.get())
    {
        gainNode.gain.setValueAtTime(0, window.audioContext.currentTime);
    }
    else
    {
        gainNode.gain.setValueAtTime(Number(gain.get()) || 0, window.audioContext.currentTime);
    }
};
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
                op.log(e);
            }
        }
        op.setUiError("audioCtx", null);
        audioOut.set(null);
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
    audioOut.set(gainNode);
};
