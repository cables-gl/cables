CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let GAIN_DEFAULT = 2;
let GAIN_MIN = 0;
let GAIN_MAX = 2; // TODO: check
let QUALITY_DEFAULT = 2;
let QUALITY_MIN = 1; // TODO: check
let QUALITY_MAX = 8; // TODO: check
let OCTAVES_DEFAULT = 6;
let OCTAVES_MIN = 1;
let OCTAVES_MAX = 30;
let BASE_FREQUENCY_DEFAULT = 100;
let BASE_FREQUENCY_MIN = 1;
let BASE_FREQUENCY_MAX = 20000;
let SENSITIVITY_DEFAULT = 0;
let WET_DEFAULT = 1.0;
let WET_MIN = 0.0;
let WET_MAX = 1.0;

// vars
let node = new Tone.AutoWah();

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let gainPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Gain", node.gain, { "display": "range", "min": GAIN_MIN, "max": GAIN_MAX }, GAIN_DEFAULT);
let qualityPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Quality", node.Q, { "display": "range", "min": QUALITY_MIN, "max": QUALITY_MIN }, QUALITY_DEFAULT);
let octavesPort = op.inValue("Octaves", OCTAVES_DEFAULT);
let baseFrequencyPort = op.inValue("Base Frequency", BASE_FREQUENCY_DEFAULT);
let sensitivityPort = op.inValue("Sensitivity", SENSITIVITY_DEFAULT);
let wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, { "display": "range", "min": WET_MIN, "max": WET_MAX }, WET_DEFAULT);

// change listeners
octavesPort.onChange = function ()
{
    let octaves = octavesPort.get();
    if (octaves && octaves >= OCTAVES_MIN && octaves <= OCTAVES_MAX)
    {
        node.set("octaves", octavesPort.get());
    }
};

baseFrequencyPort.onChange = function ()
{
    let freq = baseFrequencyPort.get();
    if (freq && freq >= BASE_FREQUENCY_MIN && freq <= BASE_FREQUENCY_MAX)
    {
        node.set("baseFrequency", baseFrequencyPort.get());
    }
};

sensitivityPort.onChange = function ()
{
    node.set("sensitivity", sensitivityPort.get());
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
