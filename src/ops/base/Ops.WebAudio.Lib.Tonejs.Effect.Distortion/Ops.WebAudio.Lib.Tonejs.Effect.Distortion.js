op.name="Distortion";

CABLES.WEBAUDIO.createAudioContext(op);

// vars
var node = new Tone.Distortion();

// default values
var DISTORTION_DEFAULT = 0.4;
var DISTORTION_MIN = 0.0;
var DISTORTION_MAX = 1.0;
var OVERSAMPLE_VALUES = ["none", "2x", "4x"];
var OVERSAMPLE_DEFAULT = "none";
var WET_DEFAULT = 1.0;
var WET_MIN = 0.0;
var WET_MAX = 1.0;

// input ports
var audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
var distortionPort = op.addInPort( new Port( op, "Distortion", CABLES.OP_PORT_TYPE_, { 'display': 'range', 'min': DISTORTION_MIN, 'max': DISTORTION_MAX } ));
distortionPort.set(DISTORTION_DEFAULT);
var oversamplePort = op.addInPort( new Port( op, "Oversample", CABLES.OP_PORT_TYPE_, { display: 'dropdown', values: OVERSAMPLE_VALUES } ) );
oversamplePort.set(OVERSAMPLE_DEFAULT);
var wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, {"display": "range", "min": WET_MIN, "max": WET_MAX}, WET_DEFAULT);

// change listeners
distortionPort.onChange = function() {
    var distortion = distortionPort.get();
    if(distortion) {
        if(distortion >= DISTORTION_MIN && distortion <= DISTORTION_MAX) {
            setNodeValue("distortion", distortion);       
        }
    }
};
oversamplePort.onChange = function() {
    var oversample = oversamplePort.get();
    if(oversample && OVERSAMPLE_VALUES.indexOf(oversample) > -1) {
        setNodeValue("oversample", oversample);       
    }
};

// functions
function setNodeValue(key, val) {
    if(key && typeof val !== 'undefined') {
        node.set(key, val);
    }
}

// output ports
var audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

