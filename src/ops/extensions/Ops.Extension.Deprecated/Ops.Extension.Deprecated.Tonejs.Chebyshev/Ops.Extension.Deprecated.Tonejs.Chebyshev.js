CABLES.WEBAUDIO.createAudioContext(op);

// vars
let node = new Tone.Chebyshev();

// default values
let ORDER_DEFAULT = 1;
let ORDER_MIN = 0; // ?
let ORDER_MAX = 10; // ?
let OVERSAMPLE_VALUES = ["none", "2x", "4x"];
let OVERSAMPLE_DEFAULT = "none";
let WET_DEFAULT = 1.0;
let WET_MIN = 0.0;
let WET_MAX = 1.0;

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let orderPort = op.addInPort(new CABLES.Port(op, "Order", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": ORDER_MIN, "max": ORDER_MAX }));
orderPort.set(ORDER_DEFAULT);
let oversamplePort = this.addInPort(new CABLES.Port(this, "align", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": OVERSAMPLE_VALUES }));
oversamplePort.set(OVERSAMPLE_DEFAULT);
let wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, { "display": "range", "min": WET_MIN, "max": WET_MAX }, WET_DEFAULT);

// change listeners
orderPort.onChange = function ()
{
    let order = orderPort.get();
    if (order)
    {
        order = Math.floor(order);
        if (order >= ORDER_MIN && order <= ORDER_MAX)
        {
            node.set("order", order);
        }
    }
};
oversamplePort.onChange = function ()
{
    let oversample = oversamplePort.get();
    if (oversample && OVERSAMPLE_VALUES.indexOf(oversample) > -1)
    {
        node.set("oversample", oversample);
    }
};

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
