CABLES.WEBAUDIO.createAudioContext(op);

// constants
let NOISE_TYPES = [
    "white",
    "brown"
];
let NOISE_TYPE_DEFAULT = "white";
let VOLUME_DEFAULT = -6;

// vars
let node = new Tone.NoiseSynth();

// input ports
let noisePort = op.addInPort(new CABLES.Port(op, "Noise Type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": NOISE_TYPES }));
noisePort.set(NOISE_TYPE_DEFAULT);
let envelopePort = op.inObject("Envelope");
let volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);

// change listeners
noisePort.onChange = function ()
{
    let noise = noisePort.get();
    if (noise && NOISE_TYPES.indexOf(noise) > -1)
    {
        node.set("noise.type", noise);
    }
    else
    {
        op.log("Warning: Invalid noise type! Valid noise types are: ", NOISE_TYPES.toString());
    }
};
envelopePort.onChange = function ()
{
    let env = envelopePort.get();
    if (env && env.attack && env.decay && env.sustain && env.release)
    {
        node.set("envelope", env);
    }
    else
    {
        op.log("Warning: The envelope cannot be used for the NoiseSynth, maybe try the second envelope output port!?");
    }
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
