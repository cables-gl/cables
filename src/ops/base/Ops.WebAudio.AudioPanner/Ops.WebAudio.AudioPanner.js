function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

const audioIn = this.addInPort(new CABLES.Port(this, "audio in", CABLES.OP_PORT_TYPE_OBJECT));
const pan = op.inFloat("Pan", 0);
pan.onChange = updateGain;
const audioOut = this.addOutPort(new CABLES.Port(this, "audio out", CABLES.OP_PORT_TYPE_OBJECT));

if (!window.audioContext) { audioContext = new AudioContext(); }

let isIOS = false;
let panNode = null;

if (window.audioContext.createStereoPanner)
{
    panNode = audioContext.createStereoPanner();
}
else
{
    panNode = window.audioContext.createPanner();
    panNode.panningModel = "equalpower";
    isIOS = true;
}

const gainNode = audioContext.createGain();

function updateGain()
{
    // gainNode.gain.value = parseFloat( gain.get() )||0;
    const panning = clamp(pan.get(), -1, 1);

    if (!isIOS) panNode.pan.setValueAtTime(panning, window.audioContext.currentTime);
    else
    {
        op.log("imehrehrehre");
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
                oldAudioIn.disconnect(panNode);
            }
            catch (e)
            {
                op.log(e);
            }
        }
    }
    else
    {
        audioIn.val.connect(panNode);
    }
    oldAudioIn = audioIn.get();
};

audioOut.set(panNode);
