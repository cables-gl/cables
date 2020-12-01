const audioContext = CABLES.WEBAUDIO.createAudioContext(op);

const inAudio0 = op.inObject("audio in 0");
const inAudio1 = op.inObject("audio in 1");
const inAudio2 = op.inObject("audio in 2");
const inAudio3 = op.inObject("audio in 3");
const inAudio4 = op.inObject("audio in 4");
const inAudio5 = op.inObject("audio in 5");
const inAudio6 = op.inObject("audio in 6");
const inAudio7 = op.inObject("audio in 7");
const audioOut = op.outObject("audio out");

const gain = audioContext.createGain();
audioOut.set(gain);

const N_PORTS = 8;

const audioIns = [inAudio0, inAudio1, inAudio2, inAudio3, inAudio4, inAudio5, inAudio6, inAudio7];
const oldAudioIns = [];

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
                    audioIns[port].get().connect(gain);
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
                if (oldAudioIns[port] && oldAudioIns[port].disconnect) oldAudioIns[port].disconnect(gain);
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
