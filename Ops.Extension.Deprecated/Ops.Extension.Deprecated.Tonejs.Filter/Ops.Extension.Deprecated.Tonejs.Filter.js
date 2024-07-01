CABLES.WEBAUDIO.createAudioContext(op);

// constants
let TYPES = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"];
let ROLLOFF_VALUES = [-12, -24, -48, -96];
let NORMAL_RANGE_MIN = 0;
let NORMAL_RANGE_MAX = 1;

let TYPE_DEFAULT = "lowpass";
let FREQUENCY_DEFAULT = 350;
let FREQUENCY_MIN = 1;
let FREQUENCY_MAX = 20000;
let DETUNE_DEFAULT = 0;
let DETUNE_MIN = 0;
let DETUNE_MAX = 1200;
let ROLLOFF_DEFAULT = -12;
let Q_DEFAULT = 1; // ?
let Q_MIN = 1; // ?
let Q_MAX = 20; // ?
let GAIN_DEFAULT = 0;
let GAIN_MIN = 0;
let GAIN_MAX = 2; // ?

// vars
let node = new Tone.Filter(FREQUENCY_DEFAULT, TYPE_DEFAULT, ROLLOFF_DEFAULT);

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, { "display": "range", "min": FREQUENCY_MIN, "max": FREQUENCY_MAX }, FREQUENCY_DEFAULT);
let detunePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Detune", node.detune, { "display": "range", "min": DETUNE_MIN, "max": DETUNE_MAX }, DETUNE_DEFAULT);
let gainPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Gain", node.gain, { "display": "range", "min": GAIN_MIN, "max": GAIN_MAX }, GAIN_DEFAULT);
let qPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Q", node.Q, { "display": "range", "min": Q_MIN, "max": Q_MAX }, Q_DEFAULT);
let typePort = op.addInPort(new CABLES.Port(op, "Type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": TYPES }, TYPE_DEFAULT));
typePort.set(TYPE_DEFAULT);
let rolloffPort = op.addInPort(new CABLES.Port(op, "Rolloff", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": ROLLOFF_VALUES }, ROLLOFF_DEFAULT));
rolloffPort.set(ROLLOFF_DEFAULT);

// change listeneers
typePort.onChange = function ()
{
    let t = typePort.get();
    if (t && TYPES.indexOf(t) > -1)
    {
        node.set("type", t);
    }
};

rolloffPort.onChange = function ()
{
    let r = rolloffPort.get();
    try
    {
        r = parseFloat(r);
    }
    catch (e)
    {
        op.log(e);
        return;
    }
    if (r && ROLLOFF_VALUES.indexOf(r) > -1)
    {
        node.set("rolloff", r);
    }
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
