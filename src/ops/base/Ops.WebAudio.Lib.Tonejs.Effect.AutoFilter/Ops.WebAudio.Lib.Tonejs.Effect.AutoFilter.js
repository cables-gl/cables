CABLES.WEBAUDIO.createAudioContext(op);

// TODO: Add filter / filter-op needed?

// vars
var node = new Tone.AutoFilter("4n").start(); // TODO: create start / stop nodes!?

// default values
var DEPTH_DEFAULT = 1;
var DEPTH_MIN = 0;
var DEPTH_MAX = 1;
var FREQUENCY_DEFAULT = 200;
var OSCILLATOR_TYPES = ["sine", "square", "triangle", "sawtooth"];
/*
var MIN_DEFAULT = 100; // ??
var MIN_MIN = 0; // ??
var MIN_MAX = 20000; // ??
*/
var OCTAVES_DEFAULT = 2.6;
var OCTAVES_MIN = -1;
var OCTAVES_MAX = 10;
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var depthPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Depth", node.depth, {"display": "range", "min": DEPTH_MIN, "max": DEPTH_MAX}, DEPTH_DEFAULT);
var frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
//var filterPort = op.inObject("Filter");
var typePort = this.addInPort( new CABLES.Port( op, "Type", CABLES.OP_PORT_TYPE_VALUE, { display: 'dropdown', values: OSCILLATOR_TYPES }, OSCILLATOR_TYPES[0] ) );
typePort.set(OSCILLATOR_TYPES[0]);
//var minPort = op.inValue("Min", MIN_DEFAULT); // not noticable, tone.js bug?
var octavesPort = op.inValue("Octaves", OCTAVES_DEFAULT);
var wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// change listeners
/*
minPort.onChange = function() {
    var min = minPort.get();
    if(min && min >= MIN_MIN && min >= MIN_MAX) {
        node.set("min", minPort.get());    
    }
};
*/

octavesPort.onChange = function() {
    var octaves = octavesPort.get();
    if(octaves) {
        octaves = Math.round(parseFloat(octaves));
        if(octaves && octaves >= OCTAVES_MIN && octaves <= OCTAVES_MAX) {
            node.set("octaves", octaves);    
        }
    }
};

typePort.onChange = function() {
    if(typePort.get()) {
        node.set("type", typePort.get());    
    }
};

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

