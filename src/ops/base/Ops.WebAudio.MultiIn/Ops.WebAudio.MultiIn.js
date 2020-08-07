
if (!window.audioContext) { window.audioContext = new AudioContext(); }

const audioOut = this.addOutPort(new CABLES.Port(this, "audio out", CABLES.OP_PORT_TYPE_OBJECT));

const gain = audioContext.createGain();
audioOut.set(gain);

const N_PORTS = 8;

const audioIns = [];
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
                audioIns[port].get().connect(gain);
            }
            catch (e) { op.log("[Error] " + e); }
        }
        else if (!audioIns[port].isLinked())
        {
            try
            {
                oldAudioIns[port].disconnect(gain);
            }
            catch (e) { op.log("[Error] " + e); }
        }
    };
};

for (let i = 0; i < N_PORTS; i++)
{
    const audioIn = this.addInPort(new CABLES.Port(this, "audio in " + i, CABLES.OP_PORT_TYPE_OBJECT));
    audioIn.audioInPortNr = i;
    audioIn.onChange = createValueChangedFunction(i);
    audioIns.push(audioIn);
}
