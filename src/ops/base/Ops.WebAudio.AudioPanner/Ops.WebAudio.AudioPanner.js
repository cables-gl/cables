function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

const audioIn = op.inObject("audio in", null, "audioNode");
const pan = op.inFloat("Pan", 0);
pan.onChange = updateGain;
const audioOut = op.outObject("audio out", null, "audioNode");

let audioContext = CABLES.WEBAUDIO.createAudioContext(op);

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

function updateGain()
{
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
        if (oldAudioIn)
        {
            try
            {
                if (oldAudioIn.disconnect)
                {
                    oldAudioIn.disconnect(panNode);
                }
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
        if (audioIn.get().connect)
        {
            audioIn.get().connect(panNode);
            audioOut.set(panNode);
        }
    }
    oldAudioIn = audioIn.get();
};
