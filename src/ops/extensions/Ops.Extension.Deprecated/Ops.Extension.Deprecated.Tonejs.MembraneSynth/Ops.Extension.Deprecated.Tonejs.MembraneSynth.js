CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let FREQUENCY_DEFAULT = 440;
let DETUNE_DEFAULT = 0;
let HARMONICITY_DEFAULT = 3;
let PARTAMENTO_DEFAULT = "16n";
let VOLUME_DEFAULT = -4;
let OSCILLATOR_TYPES = [
    "sine",
    "sine2",
    "sine3",
    "sine4",
    "sine5",
    "sine6",
    "sine7",
    "sine8",
    "square",
    "square2",
    "square3",
    "square4",
    "square5",
    "square6",
    "square7",
    "square8",
    "triangle",
    "triangle2",
    "triangle3",
    "triangle4",
    "triangle5",
    "triangle6",
    "triangle7",
    "triangle8",
    "sawtooth",
    "sawtooth2",
    "sawtooth3",
    "sawtooth4",
    "sawtooth5",
    "sawtooth6",
    "sawtooth7",
    "sawtooth8"
];
let OSCILLATOR_TYPE_DEFAULT = "sine";
let MODULATION_OSCILLATOR_TYPE_DEFAULT = "sine";
let MODULATION_INDEX_DEFAULT = 10;
let OCTAVES_DEFAULT = 10;

// vars
let node = new Tone.MembraneSynth();

// inputs
// var oscillatorPort = op.inObject("Oscillator");
let oscillatorPort = op.addInPort(new CABLES.Port(op, "Oscillator Type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": OSCILLATOR_TYPES }));
oscillatorPort.set(OSCILLATOR_TYPE_DEFAULT);
let envelopePort = op.inObject("Envelope");
let octavesPort = op.inValue("Octaves", OCTAVES_DEFAULT);
let pitchDecayPort = op.inValueSlider("Pitch Decay");
let volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);

// change listeners
oscillatorPort.onChange = function ()
{
    setNodeValue("oscillator", { "type": oscillatorPort.get() });
};
envelopePort.onChange = function ()
{
    setNodeValue("envelope", envelopePort.get());
};
octavesPort.onChange = function ()
{
    let octaves = octavesPort.get();
    if (octaves && octaves > 0)
    {
        octaves = Math.floor(octaves);
        if (octaves > 0)
        {
            setNodeValue("octaves", octaves);
        }
    }
};
pitchDecayPort.onChange = function ()
{
    let pitchDecay = pitchDecayPort.get();
    if (pitchDecay > 0)
    { // crash on 0
        setNodeValue("pitchDecay", pitchDecayPort.get());
    }
};

// functions
function setNodeValue(key, val)
{
    if (key && typeof val !== "undefined")
    {
        node.set(key, val);
    }
}

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
