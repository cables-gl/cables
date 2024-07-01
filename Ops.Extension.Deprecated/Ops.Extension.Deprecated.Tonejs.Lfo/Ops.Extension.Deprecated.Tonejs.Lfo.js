CABLES.WEBAUDIO.createAudioContext(op);

// TODO:
// - Add units?
// - Support Frequency as "C4"?

// defaults
let TYPES = ["sine", "square", "triangle", "sawtooth"];
let NORMAL_RANGE_MIN = 0;
let NORMAL_RANGE_MAX = 1;

let FREQUENCY_DEFAULT = 0.5;
let AMPLITUDE_DEFAULT = 1.0;
let MIN_DEFAULT = 0;
let MAX_DEFAULT = 1;
let TYPE_DEFAULT = "sine";
let PHASE_DEFAULT = 0;
let PHASE_MIN = 0;
let PHASE_MAX = 180;
let MUTE_DEFAULT = false;
let DETUNE_DEFAULT = 0;
let VOLUME_DEFAULT = -6;
let VOLUME_MIN = -100;
let VOLUME_MAX = 0;

// vars
let node = new Tone.LFO(FREQUENCY_DEFAULT, MIN_DEFAULT, MAX_DEFAULT).start();

// input ports
let frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
let amplitudePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Amplitude", node.amplitude, AMPLITUDE_DEFAULT);
let minPort = op.inValue("Min", MIN_DEFAULT);
let maxPort = op.inValue("Max", MAX_DEFAULT);
let typePort = op.addInPort(new CABLES.Port(op, "Type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": TYPES }));
typePort.set("sine");
let phasePort = op.addInPort(new CABLES.Port(op, "Phase", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": PHASE_MIN, "max": PHASE_MAX }, PHASE_DEFAULT));
phasePort.set(PHASE_DEFAULT);
// TODO: volume should be a dynamic port, but must be changed like this: node.volume.value, not node.set("volume", volume);
// var volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, {'display': 'range', 'min': VOLUME_MIN, 'max': VOLUME_MAX}, VOLUME_DEFAULT);
let volumePort = op.addInPort(new CABLES.Port(op, "Volume", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": VOLUME_MIN, "max": VOLUME_MAX }));
volumePort.set(VOLUME_DEFAULT);

let mutePort = op.addInPort(new CABLES.Port(op, "Mute", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
mutePort.set(false);

// change listeners
minPort.onChange = function () { setNodeValue("min", minPort.get()); };
maxPort.onChange = function () { setNodeValue("max", maxPort.get()); };
typePort.onChange = function () { setNodeValue("type", typePort.get()); };
phasePort.onChange = function () { setNodeValue("phase", phasePort.get()); };
mutePort.onChange = function () { setNodeValue("mute", mutePort.get()); };
volumePort.onChange = function ()
{
    let volume = volumePort.get();
    if (volume >= VOLUME_MIN && volume <= VOLUME_MAX)
    {
        try
        {
            node.set("volume", volume);
        }
        catch (e)
        {
            op.log(e);
        }
    }
    else
    {
        op.log("Volume out of range: ", volume);
    }
};

// functions
function setNodeValue(key, value)
{
    node.set(key, value);
}

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
