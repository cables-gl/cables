op.name="TriggerSynthAttackRelease";

// vars
var NOTE_DEFAULT = "C4";
var TIME_DEFAULT = "+0";
var VELOCITY_DEFAULT = 1.0;
var VELOCITY_MIN = 0.0;
var VELOCITY_MAX = 1.0;
var DURATION_DEFAULT = "4n";

// input
var nodePort = op.inObject("Synth");
var triggerPort = op.addInPort( new CABLES.Port( this, "Trigger Arrack Release", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var notePort = op.inValueString("Note", NOTE_DEFAULT); // frequency also works
var durationPort = op.inValueString("Duration", DURATION_DEFAULT);
var timePort = op.inValueString("Time", TIME_DEFAULT);
var velocityPort = op.inValueSlider("Velocity", VELOCITY_DEFAULT);

// change listeners
triggerPort.onTriggered = function() {
    var synth = nodePort.get();
    if(synth && synth.triggerAttackRelease) {
        var note = notePort.get();
        var duration = durationPort.get();
        var time = timePort.get();
        var velocity = velocityPort.get();
        
        // check time
        if(!CABLES.WEBAUDIO.isValidToneTime(time)) {
            op.log("Warning: Time " + time + " is invalid time, using " + TIME_DEFAULT);
            time = TIME_DEFAULT;
        }

        // check duration
        if(!CABLES.WEBAUDIO.isValidToneTime(duration)) {
            op.log("Warning: Invalid duration, using " + DURATION_DEFAULT);
            duration = DURATION_DEFAULT;
        }
        // check velocity
        if(!(velocity >= VELOCITY_MIN && velocity <= VELOCITY_MAX)) {
            op.log("Warning: Invalid velocity, using " + VELOCITY_DEFAULT);
            velocity = VELOCITY_DEFAULT;
        }
        // check note
        if(!CABLES.WEBAUDIO.isValidToneNote(note)) {
            op.log("Warning: Invalid note, using " + NOTE_DEFAULT);            
            note = NOTE_DEFAULT;
        }
        synth.triggerAttackRelease(note, duration, time, velocity);
    }
};

