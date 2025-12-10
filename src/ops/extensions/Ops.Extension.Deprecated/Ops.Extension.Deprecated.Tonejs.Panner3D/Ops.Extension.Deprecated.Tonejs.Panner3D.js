CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let POSITION_X_DEFAULT = 0;
let POSITION_Y_DEFAULT = 0;
let POSITION_Z_DEFAULT = 0;
let ORIENTATION_X_DEFAULT = 0;
let ORIENTATION_Y_DEFAULT = 0;
let ORIENTATION_Z_DEFAULT = 0;
let PANNING_MODEL_DEFAULT = "equalpower";
let PANNING_MODEL_VALUES = ["equalpower", "HRTF"];
let REFERENCE_DISTANCE_DEFAULT = 1;
let ROLL_OFF_FACTOR_DEFAULT = 1;
let DISTANCE_MODEL_DEFAULT = "inverse";
let DISTANCE_MODEL_VALUES = ["linear", "inverse", "exponential"];
let CONE_INNER_ANGLE_DEFAULT = 360;
let CONE_OUTER_ANGLE_DEFAULT = 360;
let ANGLE_MIN = 0;
let ANGLE_MAX = 360;
let CONE_OUTER_GAIN_DEFAULT = 0;
let MAXIMUM_DISTANCE_DEFAULT = 10000;

// vars
let node = new Tone.Panner3D(POSITION_X_DEFAULT, POSITION_Y_DEFAULT, POSITION_Z_DEFAULT);

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let positionXPort = op.inValue("Position X", POSITION_X_DEFAULT);
let positionYPort = op.inValue("Position Y", POSITION_Y_DEFAULT);
let positionZPort = op.inValue("Position Z", POSITION_Z_DEFAULT);
let orientationXPort = op.inValue("Orientation X", ORIENTATION_X_DEFAULT);
let orientationYPort = op.inValue("Orientation Y", ORIENTATION_Y_DEFAULT);
let orientationZPort = op.inValue("Orientation Z", ORIENTATION_Z_DEFAULT);
let panningModelPort = op.addInPort(new CABLES.Port(op, "Panning Model", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": PANNING_MODEL_VALUES }));
panningModelPort.set(PANNING_MODEL_DEFAULT);
let referenceDistancePort = op.inValue("Reference Distance", REFERENCE_DISTANCE_DEFAULT);
let rollOffFactorPort = op.inValue("Roll Off Factor", ROLL_OFF_FACTOR_DEFAULT);
let distanceModelPort = op.addInPort(new CABLES.Port(op, "Distance Model", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": DISTANCE_MODEL_VALUES }));
distanceModelPort.set(DISTANCE_MODEL_DEFAULT);
let coneInnerAnglePort = op.addInPort(new CABLES.Port(op, "Cone Inner Angle", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": ANGLE_MIN, "max": ANGLE_MAX }));
coneInnerAnglePort.set(CONE_INNER_ANGLE_DEFAULT);
let coneOuterAnglePort = op.addInPort(new CABLES.Port(op, "Cone Outer Angle", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": ANGLE_MIN, "max": ANGLE_MAX }));
coneOuterAnglePort.set(CONE_OUTER_ANGLE_DEFAULT);
let coneOuterGainPort = op.inValue("Cone Outer Gain", CONE_OUTER_GAIN_DEFAULT);
let maximumDistancePort = op.inValue("Maximum Distance", MAXIMUM_DISTANCE_DEFAULT);

// change listeners
positionXPort.onChange = function ()
{
    setNodeValue("positionX", positionXPort.get());
};
positionYPort.onChange = function ()
{
    setNodeValue("positionY", positionYPort.get());
};
positionZPort.onChange = function ()
{
    setNodeValue("positionZ", positionZPort.get());
};
orientationXPort.onChange = function ()
{
    setNodeValue("orientationX", orientationXPort.get());
};
orientationYPort.onChange = function ()
{
    setNodeValue("orientationY", orientationYPort.get());
};
orientationZPort.onChange = function ()
{
    setNodeValue("orientationZ", orientationZPort.get());
};
panningModelPort.onChange = function ()
{
    let panningModel = panningModelPort.get();
    if (isInArray(panningModel, PANNING_MODEL_VALUES))
    {
        setNodeValue("panningModel", panningModel);
    }
};
referenceDistancePort.onChange = function ()
{
    let refDistance = referenceDistancePort.get();
    setNodeValue("refDistance", refDistance);
};
rollOffFactorPort.onChange = function ()
{
    let rolloffFactor = rollOffFactorPort.get();
    setNodeValue("rolloffFactor", rolloffFactor);
};
distanceModelPort.onChange = function ()
{
    let distanceModel = distanceModelPort.get();
    if (isInArray(distanceModel, DISTANCE_MODEL_VALUES))
    {
        setNodeValue("distanceModel", distanceModel);
    }
};
coneInnerAnglePort.onChange = function ()
{
    let coneInnerAngle = coneInnerAnglePort.get();
    if (isInRange(coneInnerAngle, ANGLE_MIN), ANGLE_MAX)
    {
        setNodeValue("coneInnerAngle", coneInnerAngle);
    }
};
coneOuterAnglePort.onChange = function ()
{
    let coneOuterAngle = coneOuterAnglePort.get();
    if (isInRange(coneOuterAngle, ANGLE_MIN), ANGLE_MAX)
    {
        setNodeValue("coneOuterAngle", coneOuterAngle);
    }
};
coneOuterGainPort.onChange = function ()
{
    let coneOuterGain = coneOuterGainPort.get();
    setNodeValue("coneOuterGain", coneOuterGain);
};
maximumDistancePort.onChange = function ()
{
    let maximumDistance = maximumDistancePort.get();
    setNodeValue("maximumDistance", maximumDistance);
};

// functions
function setNodeValue(key, val)
{
    if (typeof val !== "undefined")
    {
        node.set(key, val);
    }
}

function isInRange(val, min, max)
{
    return val && val >= min && val <= max;
}

function isInArray(val, arr)
{
    return arr.indexOf(val) > -1;
}

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
