op.name = "SynthPlayerFixedLength";

CABLES.WEBAUDIO.createAudioContext(op);

// input ports
let synthPort = op.inObject("Synth");
let playTonePort = op.addInPort(new CABLES.Port(this, "Play Tone", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let notePort = op.inValueString("Note");
let velocityPort = op.inObject("Velocity");
let durationPort = op.inValueString("Duration");
let timePort = op.inValueString("Time");

// output ports
let audioOutPort = op.outObject("Audio Out");

// vars
let synth;

// default values
let DEFAULT_SYNTH = new Tone.Synth().toMaster();
let DEFAULT_NOTE = "C4";
let DEFAULT_VELOCITY = 1;
let DEFAULT_DURATION = "4n";
let DEFAULT_TIME = "C4";

// set default values
synth = DEFAULT_SYNTH;
notePort.set("C4");
velocityPort.set(1);
durationPort.set("4n");
timePort.set("+0");
audioOutPort.set(synth);

// trigger listeners
// playTonePort.onTriggered = function() {
//   op.log("Triggering sound....");
//   op.log("notePort.get(): ", notePort.get());
//   op.log("durationPort.get(): ", durationPort.get());
//   op.log("timePort.get(): ", timePort.get());
//   op.log("velocityPort.get(): ", velocityPort.get());
//   synth.triggerAttackRelease (
//     notePort.get() || DEFAULT_NOTE,
//     durationPort.get() || DEFAULT_DURATION,
//     timePort.get() || DEFAULT_TIME,
//     velocityPort.get() || DEFAULT_VELOCITY
//   );
// };

playTonePort.onTriggered = function ()
{
    op.log("Triggering sound....");
    op.log("notePort.get(): ", notePort.get());
    op.log("durationPort.get(): ", durationPort.get());
    op.log("timePort.get(): ", timePort.get());
    op.log("velocityPort.get(): ", velocityPort.get());
    synth.triggerAttackRelease(
        notePort.get(),
        durationPort.get(),
        timePort.get(),
        velocityPort.get()
    );
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
        synth.setNote();
    }
};

durationPort.onChange = function ()
{
    let val = durationPort.get();
    if (!val)
    {
        durationPort.set(DEFAULT_DURATION);
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
        velocityPort.set(DEFAULT_VELOCITY);
    }
};
