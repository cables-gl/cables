op.name = "SynthPlayerStartStop";

CABLES.WEBAUDIO.createAudioContext(op);

// default values
let DEFAULT_SYNTH = new Tone.Synth();
let DEFAULT_VELOCITY = 1;
let DEFAULT_TIME = "+0";

// input ports
let synthPort = op.inObject("Synth");
let startPort = op.addInPort(new CABLES.Port(this, "Start Play", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let stopPort = op.addInPort(new CABLES.Port(this, "Stop Play", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let notePort = op.inValueString("Note", "C5");
let velocityPort = op.inValue("Velocity", DEFAULT_VELOCITY);
let timePort = op.inValueString("Time");

// output ports
let audioOutPort = op.outObject("Audio Out");

// vars
let synth;

// set default values
synth = DEFAULT_SYNTH;
audioOutPort.set(synth);

startPort.onTriggered = function ()
{
    let note = notePort.get();
    let velocity = velocityPort.get();
    let time = timePort.get();
    if (!velocity) velocity = DEFAULT_VELOCITY;
    if (time)
    {
        synth.triggerAttack(note, time, velocity);
    }
    else
    {
        synth.triggerAttack(note, velocity);
    }
};

stopPort.onTriggered = function ()
{
    let time = timePort.get();
    if (time)
    {
        synth.triggerRelease(time);
    }
    else
    {
        synth.triggerRelease();
    }
};

// change listeners
synthPort.onChange = function ()
{
    let newSynth = synthPort.get();
    if (newSynth)
    {
        synth = newSynth;
        audioOutPort.set(synth);
    }
};

notePort.onChange = function ()
{
    let newNote = notePort.get();
    if (newNote)
    {
        let time = timePort.get();
        try
        {
            if (time)
            {
                synth.setNote(notePort.get(), time);
            }
            else
            {
                synth.setNote(notePort.get());
            }
        }
        catch (e) {}
    }
};

timePort.onChange = function ()
{
    let val = timePort.get();
    if (!val)
    {
        timePort.set(DEFAULT_TIME);
    }
};

velocityPort.onChange = function ()
{
    let val = velocityPort.get();
    if (!val)
    {
    // velocityPort.set(DEFAULT_VELOCITY)
    }
};
