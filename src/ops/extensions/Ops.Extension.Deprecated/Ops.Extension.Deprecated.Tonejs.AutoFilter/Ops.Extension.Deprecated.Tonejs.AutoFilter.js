CABLES.WEBAUDIO.createAudioContext(op);

// TODO: Add filter / filter-op needed?

// vars
let node = new Tone.AutoFilter("4n").start(); // TODO: create start / stop nodes!?

// default values
let DEPTH_DEFAULT = 1;
let DEPTH_MIN = 0;
let DEPTH_MAX = 1;
let FREQUENCY_DEFAULT = 200;
let OSCILLATOR_TYPES = ["sine", "square", "triangle", "sawtooth"];
/*
var MIN_DEFAULT = 100; // ??
var MIN_MIN = 0; // ??
var MIN_MAX = 20000; // ??
*/
let OCTAVES_DEFAULT = 2.6;
let OCTAVES_MIN = -1;
let OCTAVES_MAX = 10;
let WET_DEFAULT = 1.0;
let WET_MIN = 0.0;
let WET_MAX = 1.0;

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let depthPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Depth", node.depth, { "display": "range", "min": DEPTH_MIN, "max": DEPTH_MAX }, DEPTH_DEFAULT);
let frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
// var filterPort = op.inObject("Filter");
let typePort = this.addInPort(new CABLES.Port(op, "Type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": OSCILLATOR_TYPES }, OSCILLATOR_TYPES[0]));
typePort.set(OSCILLATOR_TYPES[0]);
// var minPort = op.inValue("Min", MIN_DEFAULT); // not noticable, tone.js bug?
let octavesPort = op.inValue("Octaves", OCTAVES_DEFAULT);
let wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, { "display": "range", "min": WET_MIN, "max": WET_MAX }, WET_DEFAULT);

// change listeners
/*
minPort.onChange = function() {
    var min = minPort.get();
    if(min && min >= MIN_MIN && min >= MIN_MAX) {
        node.set("min", minPort.get());
    }
};
*/

octavesPort.onChange = function ()
{
    let octaves = octavesPort.get();
    if (octaves)
    {
        octaves = Math.round(parseFloat(octaves));
        if (octaves && octaves >= OCTAVES_MIN && octaves <= OCTAVES_MAX)
        {
            node.set("octaves", octaves);
        }
    }
};

typePort.onChange = function ()
{
    if (typePort.get())
    {
        node.set("type", typePort.get());
    }
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
