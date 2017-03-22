op.name="Meter";

CABLES.WebAudio.createAudioContext(op);

// defaults
var TYPE_DEFAULT = Tone.Meter.Type.Level;
var TYPES = [Tone.Meter.Type.Level, Tone.Meter.Type.Signal];
var SMOOTHING_DEFAULT = 0.8;
var SMOOTHING_MIN = 0.0; // ?
var SMOOTHING_MAX = 1.0; // ?

// vars
var node = new Tone.Meter (TYPE_DEFAULT, SMOOTHING_DEFAULT);

// inputs
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var updateValuePort = op.inFunction("Update Value");
var typePort = this.addInPort( new Port( this, "Type", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: TYPES } ) );
typePort.set(TYPE_DEFAULT);
var smoothingPort = op.inValueSlider("Smoothing");
smoothingPort.set(SMOOTHING_DEFAULT);

// change listeners
updateValuePort.onTriggered = function() {
    valuePort.set(node.value);
};
smoothingPort.onChange = function() {
    var smoothing = smoothingPort.get();
    if(smoothing && smoothing >= SMOOTHING_MIN && smoothing <= SMOOTHING_MAX) {
        node.set("smoothing", smoothing);
    }    
};
typePort.onChange = function() {
    var type = typePort.get();
    if(type && TYPES.indexOf(type) > -1) {
        node.set("type", type);
    }    
};

// outputs
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);
var valuePort = op.outValue("Value");
valuePort.set(0);