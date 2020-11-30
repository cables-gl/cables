function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

const audioIn = op.inObject("audio in");
const pan = op.inFloat("Pan", 0);
pan.onChange = updateGain;
const audioOut = op.outObject("audio out");

let audioContext = null;

if (!window.audioContext) { audioContext = new AudioContext(); }
else audioContext = window.audioContext;

let isIOS = false;
let panNode = null;

if (audioContext.createStereoPanner)
{
    panNode = audioContext.createStereoPanner();
}
else
{
    panNode = audioContext.createPanner();
    panNode.panningModel = "equalpower";
    isIOS = true;
}

const gainNode = audioContext.createGain();

function updateGain()
{
    // gainNode.gain.value = parseFloat( gain.get() )||0;
    const panning = clamp(pan.get(), -1, 1);

    if (!isIOS) panNode.pan.setValueAtTime(panning, audioContext.currentTime);
    else
    {
        panNode.setPosition(panning, 0, 1 - Math.abs(panning));
    }
}

let oldAudioIn = null;

audioIn.onChange = function ()
{
    if (!audioIn.get())
    {
        op.setUiError("audioCtx", null);
        if (oldAudioIn)
        {
            try
            {
                if (oldAudioIn.disconnect) oldAudioIn.disconnect(panNode);
            }
            catch (e)
            {
                op.log(e);
            }
        }
    }
    else
    {
        if (audioIn.val.connect)
        {
            op.setUiError("audioCtx", null);
            audioIn.val.connect(panNode);
        }
        else
        {
            op.setUiError("audioCtx", "The passed input is not an audio context. Please make sure you connect an audio context to the input.", 2);
        }
    }
    oldAudioIn = audioIn.get();
};

audioOut.set(panNode);
