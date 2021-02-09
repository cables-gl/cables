function clamp(val, min, max)
{
    return Math.min(Math.max(val, min), max);
}

const audioCtx = CABLES.WEBAUDIO.createAudioContext(op);

const inAudio0 = op.inObject("Audio In 0");
const inAudio1 = op.inObject("Audio In 1");
const inAudio2 = op.inObject("Audio In 2");
const inAudio3 = op.inObject("Audio In 3");
const inAudio4 = op.inObject("Audio In 4");
const inAudio5 = op.inObject("Audio In 5");
const inAudio6 = op.inObject("Audio In 6");
const inAudio7 = op.inObject("Audio In 7");

const inAudio0Gain = op.inFloatSlider("In 0 Gain", 1);
const inAudio1Gain = op.inFloatSlider("In 1 Gain", 1);
const inAudio2Gain = op.inFloatSlider("In 2 Gain", 1);
const inAudio3Gain = op.inFloatSlider("In 3 Gain", 1);
const inAudio4Gain = op.inFloatSlider("In 4 Gain", 1);
const inAudio5Gain = op.inFloatSlider("In 5 Gain", 1);
const inAudio6Gain = op.inFloatSlider("In 6 Gain", 1);
const inAudio7Gain = op.inFloatSlider("In 7 Gain", 1);

const inAudio0Pan = op.inFloat("In 0 Pan", 0);
const inAudio1Pan = op.inFloat("In 1 Pan", 0);
const inAudio2Pan = op.inFloat("In 2 Pan", 0);
const inAudio3Pan = op.inFloat("In 3 Pan", 0);
const inAudio4Pan = op.inFloat("In 4 Pan", 0);
const inAudio5Pan = op.inFloat("In 5 Pan", 0);
const inAudio6Pan = op.inFloat("In 6 Pan", 0);
const inAudio7Pan = op.inFloat("In 7 Pan", 0);

const inMasterGain = op.inFloatSlider("Output Gain", 1);

let isIOS = false;
let panNode = null;

let createPanner = () => {};
if (audioCtx.createStereoPanner)
{
    isIOS = false;
}
else
{
    isIOS = true;
}

const audioOut = op.outObject("Audio Out");

const gain = audioCtx.createGain();
audioOut.set(gain);

const N_PORTS = 8;

const audioIns = [inAudio0, inAudio1, inAudio2, inAudio3, inAudio4, inAudio5, inAudio6, inAudio7];
const audioInGains = [inAudio0Gain, inAudio1Gain, inAudio2Gain, inAudio3Gain, inAudio4Gain, inAudio5Gain, inAudio6Gain, inAudio7Gain];
const audioInPans = [inAudio0Pan, inAudio1Pan, inAudio2Pan, inAudio3Pan, inAudio4Pan, inAudio5Pan, inAudio6Pan, inAudio7Pan];
op.setPortGroup("Audio Inputs", audioIns);
op.setPortGroup("Input", audioInGains);
op.setPortGroup("Panning", audioInPans);
op.setPortGroup("Output ", [inMasterGain]);
const oldAudioIns = audioIns.map(() => ({ "node": null, "isConnected": false }));

audioInGains.forEach((port, index) =>
{
    port.gainNode = audioCtx.createGain();
    port.onChange = () => port.gainNode.gain.linearRampToValueAtTime((audioInGains[index].get() || 0), audioCtx.currentTime + 0.01);
});

audioInPans.forEach((port, index) =>
{
    if (isIOS)
    {
        port.panNode = audioCtx.createPanner();
        port.panNode.panningModel = "equalpower";
    }
    else
    {
        port.panNode = audioCtx.createStereoPanner();
    }

    port.panNode.connect(audioInGains[index].gainNode);

    port.onChange = () =>
    {
        const panning = clamp(audioInPans[index].get(), -1, 1);
        if (!isIOS) port.panNode.pan.linearRampToValueAtTime(panning, audioCtx.currentTime + 0.01);
        else port.panNode.setPosition(panning, 0, 1 - Math.abs(panning));
    };
});

audioIns.forEach((port, index) =>
{
    port.onChange = () =>
    {
        const audioNode = audioIns[index].get();
        try
        {
            if (audioNode)
            {
                if (audioNode.connect)
                {
                    const bufferedNode = oldAudioIns[index];
                    bufferedNode.node = audioNode;
                    const gainNodePort = audioInGains[index].gainNode;
                    const panNodePort = audioInPans[index].panNode;

                    if (!bufferedNode.isConnected)
                    {
                        bufferedNode.node.connect(panNodePort);
                        gainNodePort.connect(gain);
                        bufferedNode.isConnected = true;
                    }

                    op.setUiError("audioCtx" + port, null);
                }
                else
                {
                    op.setUiError("audioCtx" + port, "The input passed to port " + port + " is not an audio context. Please make sure you connect an audio context to the input.", 2);
                }
            }
            else
            {
                const bufferedNode = oldAudioIns[index];
                const gainNodePort = audioInGains[index].gainNode;
                const panNodePort = audioInPans[index].panNode;

                if (bufferedNode.isConnected)
                {
                    bufferedNode.node.disconnect(panNodePort);
                    gainNodePort.disconnect(gain);
                    bufferedNode.isConnected = false;
                }
            }
        }
        catch (e)
        {
            op.log(e);
        }
    };
    port.audioInPortNr = index;
});

inMasterGain.onChange = () => gain.gain.linearRampToValueAtTime((inMasterGain.get() || 0), audioCtx.currentTime + 0.01);
