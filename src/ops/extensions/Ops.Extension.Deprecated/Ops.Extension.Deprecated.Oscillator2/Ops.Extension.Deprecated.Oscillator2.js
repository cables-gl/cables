this.name = "Oscillator";

CABLES.WEBAUDIO.createAudioContext(op);

// inputs
let type = this.addInPort(new CABLES.Port(this, "type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": ["sine", "square", "sawtooth", "triangle"] }));
let frequency = this.addInPort(new CABLES.Port(this, "frequency", CABLES.OP_PORT_TYPE_VALUE));

// outputs
let audioOut = this.addOutPort(new CABLES.Port(this, "audio out", CABLES.OP_PORT_TYPE_OBJECT));

// initialisation
let oscillator = audioContext.createOscillator();

audioOut.set(oscillator);
oscillator.start(0);

// defaults
type.set("sawtooth");
frequency.set(200);

// valueChanges
let updateFrequency = function ()
{
    oscillator.frequency.value = frequency.get();
};
frequency.onValueChange(updateFrequency);

let updateType = function ()
{
    oscillator.type = type.get();
};
type.onValueChange(updateType);
