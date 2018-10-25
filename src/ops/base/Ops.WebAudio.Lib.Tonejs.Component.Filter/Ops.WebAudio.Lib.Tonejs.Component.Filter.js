op.name="Filter";

CABLES.WEBAUDIO.createAudioContext(op);

// constants
var TYPES = ["lowpass", "highpass", "bandpass", "lowshelf", "highshelf", "notch", "allpass", "peaking"];
var ROLLOFF_VALUES = [-12, -24, -48, -96];
var NORMAL_RANGE_MIN = 0;
var NORMAL_RANGE_MAX = 1;


var TYPE_DEFAULT = "lowpass";
var FREQUENCY_DEFAULT = 350;
var FREQUENCY_MIN = 1;
var FREQUENCY_MAX = 20000;
var DETUNE_DEFAULT = 0;
var DETUNE_MIN = 0;
var DETUNE_MAX = 1200;
var ROLLOFF_DEFAULT = -12;
var Q_DEFAULT = 1; // ?
var Q_MIN = 1; // ?
var Q_MAX = 20; // ?
var GAIN_DEFAULT = 0;
var GAIN_MIN = 0;
var GAIN_MAX = 2; // ?

// vars
var node = new Tone.Filter(FREQUENCY_DEFAULT, TYPE_DEFAULT, ROLLOFF_DEFAULT);

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, {"display": "range", "min": FREQUENCY_MIN, "max": FREQUENCY_MAX}, FREQUENCY_DEFAULT);
var detunePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Detune", node.detune, {"display": "range", "min": DETUNE_MIN, "max": DETUNE_MAX}, DETUNE_DEFAULT);
var gainPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Gain", node.gain, {"display": "range", "min": GAIN_MIN, "max": GAIN_MAX}, GAIN_DEFAULT);
var qPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Q", node.Q, {"display": "range", "min": Q_MIN, "max": Q_MAX}, Q_DEFAULT);
var typePort = op.addInPort( new Port( op, "Type", CABLES.OP_PORT_TYPE_, { display: 'dropdown', values: TYPES }, TYPE_DEFAULT ) );
typePort.set(TYPE_DEFAULT);
var rolloffPort = op.addInPort( new Port( op, "Rolloff", CABLES.OP_PORT_TYPE_, { display: 'dropdown', values: ROLLOFF_VALUES }, ROLLOFF_DEFAULT ) );
rolloffPort.set(ROLLOFF_DEFAULT);

// change listeneers
typePort.onChange = function() {
    var t = typePort.get();
    if(t && TYPES.indexOf(t) > -1) {
        node.set("type", t);
    }
};

rolloffPort.onChange = function() {
    var r = rolloffPort.get();
    try {
        r = parseFloat(r);   
    } catch(e) {
        op.log(e); 
        return;
    }
    if(r && ROLLOFF_VALUES.indexOf(r) > -1) {
        node.set("rolloff", r);
    }
};

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);