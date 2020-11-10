const audioIn = op.inObject("audio in");
const gain = op.inFloatSlider("gain", 1);
gain.onChange = updateGain;
const audioOut = op.outObject("audio out");

if (!window.audioContext) { audioContext = new AudioContext(); }

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
    }
    else
    {
        if (audioIn.val.connect) audioIn.val.connect(gainNode);
    }
    oldAudioIn = audioIn.get();
};

gain.set(1.0);
audioOut.set(gainNode);
