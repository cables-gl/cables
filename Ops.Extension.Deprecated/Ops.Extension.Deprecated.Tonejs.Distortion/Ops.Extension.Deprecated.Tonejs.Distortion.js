CABLES.WEBAUDIO.createAudioContext(op);

// vars
let node = new Tone.Distortion();

// default values
let DISTORTION_DEFAULT = 0.4;
let DISTORTION_MIN = 0.0;
let DISTORTION_MAX = 1.0;
let OVERSAMPLE_VALUES = ["none", "2x", "4x"];
let OVERSAMPLE_DEFAULT = "none";
let WET_DEFAULT = 1.0;
let WET_MIN = 0.0;
let WET_MAX = 1.0;

// input ports
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let distortionPort = op.addInPort(new CABLES.Port(op, "Distortion", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": DISTORTION_MIN, "max": DISTORTION_MAX }));
distortionPort.set(DISTORTION_DEFAULT);
let oversamplePort = op.addInPort(new CABLES.Port(op, "Oversample", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": OVERSAMPLE_VALUES }));
oversamplePort.set(OVERSAMPLE_DEFAULT);
let wetPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Wet", node.wet, { "display": "range", "min": WET_MIN, "max": WET_MAX }, WET_DEFAULT);

// change listeners
distortionPort.onChange = function ()
{
    let distortion = distortionPort.get();
    if (distortion)
    {
        if (distortion >= DISTORTION_MIN && distortion <= DISTORTION_MAX)
        {
            setNodeValue("distortion", distortion);
        }
    }
};
oversamplePort.onChange = function ()
{
    let oversample = oversamplePort.get();
    if (oversample && OVERSAMPLE_VALUES.indexOf(oversample) > -1)
    {
        setNodeValue("oversample", oversample);
    }
};

// functions
function setNodeValue(key, val)
{
    if (key && typeof val !== "undefined")
    {
        node.set(key, val);
    }
}

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
