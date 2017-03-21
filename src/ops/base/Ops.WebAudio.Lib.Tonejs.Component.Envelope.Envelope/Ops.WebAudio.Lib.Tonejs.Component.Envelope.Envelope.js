op.name="Envelope";

CABLES.WebAudio.createAudioContext(op);

// vars
var node = new Tone.Envelope();

// global functions
op.webAudio = op.WebAudio || {};
op.webAudio.setNodeSettings = function(settings) {
    if(settings) {
        node.set(settings);
        updateUi();
    }
};

// input port

var attackPort = op.addInPort( new Port( this, "Attack", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));
var decayPort = op.addInPort( new Port( this, "Decay", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));
var sustainPort = op.addInPort( new Port( this, "Sustain", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));
var releasePort = op.addInPort( new Port( this, "Release", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));
var triggerAttackPort = op.addInPort( new Port( this, "Trigger Attack", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var velocityPort = op.addInPort( new Port( this, "Velocity", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': 0, 'max': 1 } ));
var attackTimePort = op.inValueString("Attack Time");
var triggerReleasePort = op.addInPort( new Port( this, "Trigger Release", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var releaseTimePort = op.inValueString("Release Time");

// output port
var signalPort = op.outObject("Signal");
var envObjPort = op.outObject("Envelope Object");

// change listeners
attackPort.onChange = function() {
    node.set("attack", attackPort.get());
    updateEnvObjPort();
    // signalPort.forceChange(); not working, so we need the envObjPort
};
decayPort.onChange = function() {
    node.set("decay", decayPort.get());
    updateEnvObjPort();
};
sustainPort.onChange = function() {
    node.set("sustain", sustainPort.get());
    updateEnvObjPort();
};
releasePort.onChange = function() {
    node.set("release", releasePort.get());
    updateEnvObjPort();
};

triggerAttackPort.onTriggered = function(){
    var velocity = velocityPort.get();
    var time = attackTimePort.get();
    if(!CABLES.WebAudio.isValidToneTime(time)) {
        time = DEFAULT_ATTACK_TIME;
    }
    node.triggerAttack(time, velocity);
};

triggerReleasePort.onTriggered = function(){
    var time = releaseTimePort.get();
    if(!CABLES.WebAudio.isValidToneTime(time)) {
        time = DEFAULT_RELEASE_TIME;
    }
    node.triggerRelease(time);
};

// default values
var DEFAULT_ENVELOPE_OBJ = {
    'attack': 0.1,
    'decay': 0.2,
    'sustain': 1,
    'release' : 0.8
};
var DEFAULT_ATTACK_TIME = "+0";
var DEFAULT_RELEASE_TIME = "+0.125";
var DEFAULT_VELOCITY = 1.0;

// functions
function updateEnvObjPort() {
    envObjPort.set({
        'attack': attackPort.get(),
        'decay': decayPort.get(),
        'sustain': sustainPort.get(),
        'release': releasePort.get()
    });    
}

function updateUi() {
    attackPort.set(node.get("attack").attack);
    decayPort.set(node.get("decay").decay);
    sustainPort.set(node.get("sustain").sustain);
    releasePort.set(node.get("release").release);
}

// set defaults (input)
envObjPort.set(DEFAULT_ENVELOPE_OBJ);
attackPort.set(DEFAULT_ENVELOPE_OBJ.attack);
decayPort.set(DEFAULT_ENVELOPE_OBJ.decay);
sustainPort.set(DEFAULT_ENVELOPE_OBJ.sustain);
releasePort.set(DEFAULT_ENVELOPE_OBJ.release);
attackTimePort.set(DEFAULT_ATTACK_TIME);
releaseTimePort.set(DEFAULT_RELEASE_TIME);
velocityPort.set(DEFAULT_VELOCITY);

// set defaults (output)
signalPort.set(node);
updateEnvObjPort();    



