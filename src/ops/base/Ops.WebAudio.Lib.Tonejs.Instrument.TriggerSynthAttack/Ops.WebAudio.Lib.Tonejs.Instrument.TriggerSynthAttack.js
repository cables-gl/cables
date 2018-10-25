op.name="TriggerSynthAttack";

// input
var nodePort = op.inObject("Synth");
var triggerPort = op.addInPort( new CABLES.Port( this, "Trigger Arrack",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
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
        if(!CABLES.WEBAUDIO.isValidToneTime(time)) {
            op.uiAttr( { "error": "Invalid time, using '+0'" } );
            time = "+0";
        }
        
        // check tone
        if(!CABLES.WEBAUDIO.isValidToneNote(note)) {
            op.uiAttr( { 'error': 'Invalid note, should be either a tone, e.g. "C4" or a frequency, e.g. "440"' } );
            return;
        }
            
        synth.triggerAttack(note, time, velocity);
        // clear UI error
        op.uiAttr( { 'error': null } );
    }
};

