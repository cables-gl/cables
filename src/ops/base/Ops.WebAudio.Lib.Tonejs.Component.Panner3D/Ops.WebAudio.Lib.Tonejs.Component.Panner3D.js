op.name="Panner3D";

CABLES.WebAudio.createAudioContext(op);

// defaults
var POSITION_X_DEFAULT = 0;
var POSITION_Y_DEFAULT = 0;
var POSITION_Z_DEFAULT = 0;
var ORIENTATION_X_DEFAULT = 0;
var ORIENTATION_Y_DEFAULT = 0;
var ORIENTATION_Z_DEFAULT = 0;
var PANNING_MODEL_DEFAULT = "equalpower";
var PANNING_MODEL_VALUES = ["equalpower", "HRTF"];
var REFERENCE_DISTANCE_DEFAULT = 1;
var ROLL_OFF_FACTOR_DEFAULT = 1;
var DISTANCE_MODEL_DEFAULT = "inverse";
var DISTANCE_MODEL_VALUES = ["linear", "inverse", "exponential"];
var CONE_INNER_ANGLE_DEFAULT = 360;
var CONE_OUTER_ANGLE_DEFAULT = 360;
var ANGLE_MIN = 0;
var ANGLE_MAX = 360;
var CONE_OUTER_GAIN_DEFAULT = 0;
var MAXIMUM_DISTANCE_DEFAULT = 10000;

// vars
var node = new Tone.Panner3D(POSITION_X_DEFAULT, POSITION_Y_DEFAULT, POSITION_Z_DEFAULT);

// input ports
var audioInPort = CABLES.WebAudio.createAudioInPort(op, "Audio In", node);
var positionXPort = op.inValue("Position X", POSITION_X_DEFAULT);
var positionYPort = op.inValue("Position Y", POSITION_Y_DEFAULT);
var positionZPort = op.inValue("Position Z", POSITION_Z_DEFAULT);
var orientationXPort = op.inValue("Orientation X", ORIENTATION_X_DEFAULT);
var orientationYPort = op.inValue("Orientation Y", ORIENTATION_Y_DEFAULT);
var orientationZPort = op.inValue("Orientation Z", ORIENTATION_Z_DEFAULT);
var panningModelPort = op.addInPort( new Port( op, "Panning Model", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: PANNING_MODEL_VALUES } ) );
panningModelPort.set(PANNING_MODEL_DEFAULT);
var referenceDistancePort = op.inValue("Reference Distance", REFERENCE_DISTANCE_DEFAULT);
var rollOffFactorPort = op.inValue("Roll Off Factor", ROLL_OFF_FACTOR_DEFAULT);
var distanceModelPort = op.addInPort( new Port( op, "Distance Model", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: DISTANCE_MODEL_VALUES } ) );
distanceModelPort.set(DISTANCE_MODEL_DEFAULT);
var coneInnerAnglePort = op.addInPort( new Port( op, "Cone Inner Angle", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': ANGLE_MIN, 'max': ANGLE_MAX } ));
coneInnerAnglePort.set(CONE_INNER_ANGLE_DEFAULT);
var coneOuterAnglePort = op.addInPort( new Port( op, "Cone Outer Angle", OP_PORT_TYPE_VALUE, { 'display': 'range', 'min': ANGLE_MIN, 'max': ANGLE_MAX } ));
coneOuterAnglePort.set(CONE_OUTER_ANGLE_DEFAULT);
var coneOuterGainPort = op.inValue("Cone Outer Gain", CONE_OUTER_GAIN_DEFAULT);
var maximumDistancePort = op.inValue("Maximum Distance", MAXIMUM_DISTANCE_DEFAULT);

// change listeners
positionXPort.onChange = function() {
    setNodeValue("positionX", positionXPort.get());
};
positionYPort.onChange = function() {
    setNodeValue("positionY", positionYPort.get());
};
positionZPort.onChange = function() {
    setNodeValue("positionZ", positionZPort.get());
};
orientationXPort.onChange = function() {
    setNodeValue("orientationX", orientationXPort.get());
};
orientationYPort.onChange = function() {
    setNodeValue("orientationY", orientationYPort.get());
};
orientationZPort.onChange = function() {
    setNodeValue("orientationZ", orientationZPort.get());
};
panningModelPort.onChange = function() {
    var panningModel = panningModelPort.get();
    if(isInArray(panningModel, PANNING_MODEL_VALUES)) {
        setNodeValue("panningModel", panningModel);
    }
};
referenceDistancePort.onChange = function() {
    var refDistance = referenceDistancePort.get();
    setNodeValue("refDistance", refDistance);
};
rollOffFactorPort.onChange = function() {
    var rolloffFactor = rollOffFactorPort.get();
    setNodeValue("rolloffFactor", rolloffFactor);
};
distanceModelPort.onChange = function() {
    var distanceModel = distanceModelPort.get();
    if(isInArray(distanceModel, DISTANCE_MODEL_VALUES)) {
        setNodeValue("distanceModel", distanceModel);
    }
};
coneInnerAnglePort.onChange = function() {
    var coneInnerAngle = coneInnerAnglePort.get();
    if(isInRange(coneInnerAngle, ANGLE_MIN), ANGLE_MAX) {
        setNodeValue("coneInnerAngle", coneInnerAngle);
    }
};
coneOuterAnglePort.onChange = function() {
    var coneOuterAngle = coneOuterAnglePort.get();
    if(isInRange(coneOuterAngle, ANGLE_MIN), ANGLE_MAX) {
        setNodeValue("coneOuterAngle", coneOuterAngle);
    }
};
coneOuterGainPort.onChange = function() {
    var coneOuterGain = coneOuterGainPort.get();
    setNodeValue("coneOuterGain", coneOuterGain);
};
maximumDistancePort.onChange = function() {
    var maximumDistance = maximumDistancePort.get();
    setNodeValue("maximumDistance", maximumDistance);
};

// functions
function setNodeValue(key, val) {
    if(typeof val !== 'undefined') {
        node.set(key, val);
    }
}

function isInRange(val, min, max) {
    return val && val >= min && val <= max;
}

function isInArray(val, arr) {
    return arr.indexOf(val) > -1;
}


// output ports
var audioOutPort = CABLES.WebAudio.createAudioOutPort(op, "Audio Out", node);