CABLES.WEBAUDIO.createAudioContext(op);

// constants
let MAX_DELAY_DEFAULT = 0.005;
let MAX_DELAY_MIN = 0.001;
let MAX_DELAY_MAX = 0.01;
let FREQUENCY_DEFAULT = 5;
let FREQUENCY_MIN = 0.01;
let FREQUENCY_MAX = 100;
let DEPTH_DEFAULT = 0.1;
let DEPTH_MIN = 0.0;
let DEPTH_MAX = 1.0;
let TYPES = [
    "sine",
    "square",
    "triangle",
    "sawtooth"
];
let TYPE_DEFAULT = "sine";
let WET_DEFAULT = 1.0;
let WET_MIN = 0.0;
let WET_MAX = 1.0;

// vars
let node = new Tone.Vibrato(FREQUENCY_DEFAULT, DEPTH_DEFAULT);

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, { "display": "range", "min": FREQUENCY_MIN, "max": FREQUENCY_MAX }, node.get("frequency").frequency);
let depthPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Depth", node.depth, { "display": "range", "min": DEPTH_MIN, "max": DEPTH_MAX }, node.get("depth").depth);
let typePort = op.addInPort(new CABLES.Port(op, "Type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": TYPES }, TYPE_DEFAULT));
// typePort.set(TYPE_DEFAULT);
let wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, { "display": "range", "min": WET_MIN, "max": WET_MAX }, node.get("wet").wet);

// change listeneres
typePort.onChange = function ()
{
    let t = typePort.get();
    if (t && TYPES.indexOf(t) > -1)
    {
        node.set("type", t);
    }
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

// clean up
op.onDelete = function ()
{
    node.dispose();
};
