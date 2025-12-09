CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let BITS_DEFAULT = 4;
let BITS_MIN = 1;
let BITS_MAX = 8;
let WET_DEFAULT = 1.0;
let WET_MIN = 0.0;
let WET_MAX = 1.0;

// vars
let node = new Tone.BitCrusher(BITS_DEFAULT);

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let bitsPort = op.addInPort(new CABLES.Port(this, "Bits", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": BITS_MIN, "max": BITS_MAX }, BITS_DEFAULT));
bitsPort.set(BITS_DEFAULT);
let wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, { "display": "range", "min": WET_MIN, "max": WET_MAX }, WET_DEFAULT);

// change listeners
bitsPort.onChange = function ()
{
    let bits = bitsPort.get();
    if (bits && bits >= BITS_MIN && bits <= BITS_MAX)
    {
        node.set("bits", bitsPort.get());
    }
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

bitsPort.set(BITS_DEFAULT);
