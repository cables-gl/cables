op.name="BitCrusher";

CABLES.WEBAUDIO.createAudioContext(op);

// defaults
var BITS_DEFAULT = 4;
var BITS_MIN = 1;
var BITS_MAX = 8;
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// vars
var node = new Tone.BitCrusher(BITS_DEFAULT);

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var bitsPort = op.addInPort( new Port( this, "Bits", OP_PORT_TYPE_VALUE, { 'display': 'range', "min": BITS_MIN, "max": BITS_MAX }, BITS_DEFAULT));
bitsPort.set(BITS_DEFAULT);
var wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// change listeners
bitsPort.onChange = function() {
    var bits = bitsPort.get();
    if(bits && bits >= BITS_MIN && bits <= BITS_MAX ) {
        node.set("bits", bitsPort.get());        
    }
};

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

bitsPort.set(BITS_DEFAULT);
