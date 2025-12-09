// vars
let NOTE_DEFAULT = "C4";
let TIME_DEFAULT = "+0";
let VELOCITY_DEFAULT = 1.0;
let VELOCITY_MIN = 0.0;
let VELOCITY_MAX = 1.0;
let DURATION_DEFAULT = "4n";

// input
let nodePort = op.inObject("Synth");
let triggerPort = op.addInPort(new CABLES.Port(this, "Trigger Arrack Release", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let notePort = op.inValueString("Note", NOTE_DEFAULT); // frequency also works
let durationPort = op.inValueString("Duration", DURATION_DEFAULT);
let timePort = op.inValueString("Time", TIME_DEFAULT);
let velocityPort = op.inValueSlider("Velocity", VELOCITY_DEFAULT);

// change listeners
triggerPort.onTriggered = function ()
{
    let synth = nodePort.get();
    if (synth && synth.triggerAttackRelease)
    {
        let note = notePort.get();
        let duration = durationPort.get();
        let time = timePort.get();
        let velocity = velocityPort.get();

        // check time
        if (!CABLES.WEBAUDIO.isValidToneTime(time))
        {
            op.log("Warning: Time " + time + " is invalid time, using " + TIME_DEFAULT);
            time = TIME_DEFAULT;
        }

        // check duration
        if (!CABLES.WEBAUDIO.isValidToneTime(duration))
        {
            op.log("Warning: Invalid duration, using " + DURATION_DEFAULT);
            duration = DURATION_DEFAULT;
        }
        // check velocity
        if (!(velocity >= VELOCITY_MIN && velocity <= VELOCITY_MAX))
        {
            op.log("Warning: Invalid velocity, using " + VELOCITY_DEFAULT);
            velocity = VELOCITY_DEFAULT;
        }
        // check note
        if (!CABLES.WEBAUDIO.isValidToneNote(note))
        {
            op.log("Warning: Invalid note, using " + NOTE_DEFAULT);
            note = NOTE_DEFAULT;
        }
        synth.triggerAttackRelease(note, duration, time, velocity);
    }
};
