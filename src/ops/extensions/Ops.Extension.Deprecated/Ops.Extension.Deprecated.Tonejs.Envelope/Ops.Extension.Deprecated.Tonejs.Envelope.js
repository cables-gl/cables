CABLES.WEBAUDIO.createAudioContext(op);

// vars
let node = new Tone.Envelope();

// global functions
op.webAudio = op.WebAudio || {};
op.webAudio.setNodeSettings = function (settings)
{
    if (settings)
    {
        node.set(settings);
        updateUi();
    }
};

// input port

let attackPort = op.addInPort(new CABLES.Port(this, "Attack", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": 0, "max": 1 }));
let decayPort = op.addInPort(new CABLES.Port(this, "Decay", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": 0, "max": 1 }));
let sustainPort = op.addInPort(new CABLES.Port(this, "Sustain", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": 0, "max": 1 }));
let releasePort = op.addInPort(new CABLES.Port(this, "Release", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": 0, "max": 1 }));
let triggerAttackPort = op.addInPort(new CABLES.Port(this, "Trigger Attack", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let velocityPort = op.addInPort(new CABLES.Port(this, "Velocity", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": 0, "max": 1 }));
let attackTimePort = op.inValueString("Attack Time");
let triggerReleasePort = op.addInPort(new CABLES.Port(this, "Trigger Release", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let releaseTimePort = op.inValueString("Release Time");

// output port
let signalPort = op.outObject("Signal");
let envObjPort = op.outObject("Envelope Object");

// change listeners
attackPort.onChange = function ()
{
    node.set("attack", attackPort.get());
    updateEnvObjPort();
    signalPort.set(node);
};
decayPort.onChange = function ()
{
    node.set("decay", decayPort.get());
    updateEnvObjPort();
    signalPort.set(node);
};
sustainPort.onChange = function ()
{
    node.set("sustain", sustainPort.get());
    updateEnvObjPort();
    signalPort.set(node);
};
releasePort.onChange = function ()
{
    node.set("release", releasePort.get());
    updateEnvObjPort();
    signalPort.set(node);
};

triggerAttackPort.onTriggered = function ()
{
    let velocity = velocityPort.get();
    let time = attackTimePort.get();
    if (!CABLES.WEBAUDIO.isValidToneTime(time))
    {
        time = DEFAULT_ATTACK_TIME;
    }
    node.triggerAttack(time, velocity);
};

triggerReleasePort.onTriggered = function ()
{
    let time = releaseTimePort.get();
    if (!CABLES.WEBAUDIO.isValidToneTime(time))
    {
        time = DEFAULT_RELEASE_TIME;
    }
    node.triggerRelease(time);
};

// default values
let DEFAULT_ENVELOPE_OBJ = {
    "attack": 0.1,
    "decay": 0.2,
    "sustain": 1,
    "release": 0.8
};
var DEFAULT_ATTACK_TIME = "+0";
var DEFAULT_RELEASE_TIME = "+0.125";
let DEFAULT_VELOCITY = 1.0;

// functions
function updateEnvObjPort()
{
    envObjPort.set({
        "attack": attackPort.get(),
        "decay": decayPort.get(),
        "sustain": sustainPort.get(),
        "release": releasePort.get()
    });
}

function updateUi()
{
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
