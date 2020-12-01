const audioCtx = CABLES.WEBAUDIO.createAudioContext();

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
const inMasterGain = op.inFloatSlider("Output Gain", 1);

const audioOut = op.outObject("audio out");

const gain = audioContext.createGain();
audioOut.set(gain);

const N_PORTS = 8;

const audioIns = [inAudio0, inAudio1, inAudio2, inAudio3, inAudio4, inAudio5, inAudio6, inAudio7];
const audioInGains = [inAudio0Gain, inAudio1Gain, inAudio2Gain, inAudio3Gain, inAudio4Gain, inAudio5Gain, inAudio6Gain, inAudio7Gain];
op.setPortGroup("Audio Inputs", audioIns);
op.setPortGroup("Input", audioInGains);
op.setPortGroup("Output ", [inMasterGain]);
const oldAudioIns = [];

audioInGains.forEach((port, index) =>
{
    port.gainNode = audioCtx.createGain();
    port.onChange = () =>
    {
        port.gainNode.gain.setValueAtTime((audioInGains[index].get() || 0), audioCtx.currentTime);
    };
});
// returns a function that closes around the `current_i` formal parameter.
const createValueChangedFunction = function (port)
{
    // value changed function
    return function ()
    {
        if (audioIns[port].get())
        {
            oldAudioIns[port] = audioIns[port].get();
            try
            {
                if (audioIns[port].get().connect)
                {
                    audioIns[port].get().connect(audioInGains[port].gainNode);
                    audioInGains[port].gainNode.connect(gain);
                    op.setUiError("audioCtx" + port, null);
                }
                else op.setUiError("audioCtx" + port, "The input passed to port " + port + " is not an audio context. Please make sure you connect an audio context to the input.", 2);
            }
            catch (e) { op.log("[Error] " + e); }
        }
        else if (!audioIns[port].isLinked())
        {
            op.setUiError("audioCtx" + port, null);
            try
            {
                if (oldAudioIns[port] && oldAudioIns[port].disconnect)
                {
                    oldAudioIns[port].disconnect(audioInGains[port].gainNode);
                    audioInGains[port].gainNode.disconnect(gain);
                }
            }
            catch (e) { op.log("[Error] " + e); }
        }
    };
};

audioIns.forEach((port, index) =>
{
    port.onChange = createValueChangedFunction(index);
    port.audioInPortNr = index;
});

inMasterGain.onChange = () => gain.gain.setValueAtTime((inMasterGain.get() || 0), audioCtx.currentTime);
