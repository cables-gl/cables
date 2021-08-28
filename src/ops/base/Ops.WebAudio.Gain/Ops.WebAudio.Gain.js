const audioIn = op.inObject("audio in", null, "audioNode");
const gain = op.inFloatSlider("gain", 1);
const inMute = op.inBool("Mute", false);
const audioOut = op.outObject("audio out", null, "audioNode");

const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);
const gainNode = audioContext.createGain();

gain.onChange = () =>
{
    if (inMute.get()) return;

    gainNode.gain.setValueAtTime(Number(gain.get()) || 0, audioCtx.currentTime);
};

inMute.onChange = () =>
{
    if (inMute.get())
    {
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.01);
    }
    else
    {
        gainNode.gain.linearRampToValueAtTime(Number(gain.get()) || 0, audioCtx.currentTime + 0.01);
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
        audioOut.set(null);
    }
    else
    {
        if (audioIn.get().connect) audioIn.get().connect(gainNode);
    }
    oldAudioIn = audioIn.get();
    audioOut.set(gainNode);
};
