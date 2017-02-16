op.name="Chebyshev";

CABLES.WebAudio.createAudioContext(op);

// vars
var node = new Tone.Chebyshev();

// default values
var ORDER_DEFAULT = 1;
var ORDER_MIN = 0; // ?
var ORDER_MAX = 10; // ?
var OVERSAMPLE_VALUES = ["none", "2x", "4x"];
var OVERSAMPLE_DEFAULT = "none";
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var orderPort = op.addInPort( new Port( op, "Order", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': ORDER_MIN, 'max': ORDER_MAX } ));
orderPort.set(ORDER_DEFAULT);
var oversamplePort = this.addInPort( new Port( this, "align", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: OVERSAMPLE_VALUES } ) );
oversamplePort.set(OVERSAMPLE_DEFAULT);
var wetPort = CABLES.WebAudio.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// change listeners
orderPort.onChange = function() {
    var order = orderPort.get();
    if(order) {
        order = Math.floor(order);
        if(order >= ORDER_MIN && order <= ORDER_MAX) {
            node.set("order", order);    
        }
    }
};
oversamplePort.onChange = function() {
    var oversample = oversamplePort.get();
    if(oversample && OVERSAMPLE_VALUES.indexOf(oversample) > -1) {
        node.set("oversample", oversample);
    }
};

// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);

