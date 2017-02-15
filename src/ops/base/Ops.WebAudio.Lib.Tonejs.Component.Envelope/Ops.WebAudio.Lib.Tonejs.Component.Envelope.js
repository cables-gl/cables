op.name="Envelope";

CABLES.WebAudio.createAudioContext(op);

// input port

var attackPort = op.addInPort( new Port( this, "Attack", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));
var decayPort = op.addInPort( new Port( this, "Decay", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));
var sustainPort = op.addInPort( new Port( this, "Sustain", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));
var releasePort = op.addInPort( new Port( this, "Release", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));
var triggerAttackPort = op.addInPort( new Port( this, "Trigger Attack", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var triggerReleasePort = op.addInPort( new Port( this, "Trigger Release", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var timePort = op.inValueString("Time");
var velocityPort = op.addInPort( new Port( this, "Velocity", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));

// output port
var signalPort = op.outObject("Signal");
var envObjPort = op.outObject("Envelope Object");

// change listeners
attackPort.onChange = function() {
    env.set("attack", attackPort.get());
    updateEnvObjPort();
};
decayPort.onChange = function() {
    env.set("decay", decayPort.get());
    updateEnvObjPort();
};
sustainPort.onChange = function() {
    env.set("sustain", sustainPort.get());
    updateEnvObjPort();
};
releasePort.onChange = function() {
    env.set("release", releasePort.get());
    updateEnvObjPort();
};

triggerAttackPort.onTriggered = function(){
    var velocity = velocityPort.get();
    var time = timePort.get();
    env.triggerAttack(time, velocity);
};

triggerReleasePort.onTriggered = function(){
    var time = timePort.get();
    env.triggerRelease(time);
};

// default values
var DEFAULT_ENVELOPE_OBJ = {
    attack: 0.1,
    decay: 0.2,
    sustain: 1,
    release: 0.8
};
var DEFAULT_TIME = "+0";
var DEFAULT_VELOCITY = 1.0;

// vars
var env = new Tone.Envelope();

// functions
function updateEnvObjPort() {
    envObjPort.set({
        attack: attackPort.get(),
        decay: decayPort.get(),
        sustain: sustainPort.get(),
        release: releasePort.get()
    });    
}

op.onLoaded = function() {
    op.log("Loadedddddddddddddd");
    // set defaults (input)
    envObjPort.set(DEFAULT_ENVELOPE_OBJ);
    attackPort.set(DEFAULT_ENVELOPE_OBJ.attack);
    decayPort.set(DEFAULT_ENVELOPE_OBJ.decay);
    sustainPort.set(DEFAULT_ENVELOPE_OBJ.sustain);
    releasePort.set(DEFAULT_ENVELOPE_OBJ.release);
    timePort.set(DEFAULT_TIME);
    velocityPort.set(DEFAULT_VELOCITY);
    
    // set defaults (output)
    signalPort.set(env);
    updateEnvObjPort();    
};



