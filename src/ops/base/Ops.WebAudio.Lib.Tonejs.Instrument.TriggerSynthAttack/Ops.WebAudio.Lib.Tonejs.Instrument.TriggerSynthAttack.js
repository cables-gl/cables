op.name="TriggerSynthAttack";

// input
var nodePort = op.inObject("Synth");
var triggerPort = op.addInPort( new Port( this, "Trigger Arrack", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var notePort = op.inValueString("Note", "C4"); // frequency also works
var velocityPort = op.inValueSlider("Velocity", 1.0);
var timePort = op.inValueString("Time", "+0");

// change listeners
triggerPort.onTriggered = function() {
    var synth = nodePort.get();
    if(synth && synth.triggerAttack) {
        var note = notePort.get();
        var time = timePort.get();
        var velocity = velocityPort.get();
        
        // check time
        try {
            new Tone.TimeBase(time)
        } catch(e) {
            op.log("Warning: Invalid time, using '+0'");
            time = "+0";
        }
        
        // check tone
        try {
            Tone.Frequency(note);
        } catch(e) {
            op.uiAttr( { 'error': 'Invalid note, should be either a tone, e.g. "C4" or a frequency, e.g. "440"' } );
            return;
        }
        synth.triggerAttack(note, time, velocity);
        op.uiAttr( { 'error': null } ); // clear UI error
    }
};

