CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let TYPES = [
    "sine",
    "sine2",
    "sine3",
    "sine4",
    "sine5",
    "sine6",
    "sine7",
    "sine8",
    "square",
    "square2",
    "square3",
    "square4",
    "square5",
    "square6",
    "square7",
    "square8",
    "triangle",
    "triangle2",
    "triangle3",
    "triangle4",
    "triangle5",
    "triangle6",
    "triangle7",
    "triangle8",
    "sawtooth",
    "sawtooth2",
    "sawtooth3",
    "sawtooth4",
    "sawtooth5",
    "sawtooth6",
    "sawtooth7",
    "sawtooth8"
];
let NORMAL_RANGE_MIN = 0;
let NORMAL_RANGE_MAX = 1;

let FREQUENCY_DEFAULT = 440;
let TYPE_DEFAULT = "sine";
let DETUNE_DEFAULT = 0;
let PHASE_DEFAULT = 0;
let PHASE_MIN = 0;
let PHASE_MAX = 180;
let VOLUME_DEFAULT = -6;
let VOLUME_MIN = -96;
let VOLUME_MAX = 0;
let SYNC_FREQUENCY_DEFAULT = false;
let START_DEFAULT = true;
let START_TIME_DEFAULT = "+0";
let STOP_TIME_DEFAULT = "+0";
let AUTO_START_DEFAULT = true;

// vars
let node = new Tone.Oscillator(FREQUENCY_DEFAULT, TYPE_DEFAULT);

// input ports
let frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
let detunePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Detune", node.detune, null, DETUNE_DEFAULT);
let typePort = op.addInPort(new CABLES.Port(op, "Type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": TYPES }));
typePort.set("sine");
let phasePort = op.addInPort(new CABLES.Port(op, "Phase", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": PHASE_MIN, "max": PHASE_MAX }, PHASE_DEFAULT));
phasePort.set(PHASE_DEFAULT);
let syncFrequencyPort = op.inValueBool("Sync Frequency", SYNC_FREQUENCY_DEFAULT);
let startPort = op.addInPort(new CABLES.Port(op, "Start", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
let stopPort = op.addInPort(new CABLES.Port(op, "Stop", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
let autoStartPort = op.inValueBool("Auto Start", AUTO_START_DEFAULT);
let volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, { "display": "range", "min": VOLUME_MIN, "max": VOLUME_MAX }, VOLUME_DEFAULT);
// volumePort.set(VOLUME_DEFAULT);

let mutePort = op.addInPort(new CABLES.Port(op, "Mute", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
mutePort.set(false);

function setSyncAndAutostart()
{
    let syncFrequency = syncFrequencyPort.get();
    if (syncFrequency)
    {
        syncFrequency();
    }
    else
    {
        unsyncFrequency();
    }
    if (autoStartPort.get())
    {
        start();
    }
}

// init
op.onLoaded = setSyncAndAutostart;

// change listeners
typePort.onChange = function () { setNodeValue("type", typePort.get()); };
phasePort.onChange = function () { setNodeValue("phase", phasePort.get()); };
mutePort.onChange = function () { setNodeValue("mute", mutePort.get()); };

// functions
function syncFrequency()
{
    node.syncFrequency();
}

function unsyncFrequency()
{
    node.unsyncFrequency();
}

function start()
{
    if (node.state !== "started")
    {
        let startTime = startTimePort.get();
        if (!CABLES.WEBAUDIO.isValidToneTime(startTime))
        {
            startTime = START_TIME_DEFAULT;
        }
        node.start(startTime);
    }
}

function stop()
{
    if (node.state !== "stopped")
    {
        let stopTime = stopTimePort.get();
        if (!CABLES.WEBAUDIO.isValidToneTime(stopTime))
        {
            stopTime = STOP_TIME_DEFAULT;
        }
        node.stop(stopTime);
    }
}

function setNodeValue(key, value)
{
    try
    {
        node.set(key, value);
    }
    catch (e)
    {
        op.log("ERROR!", e);
    }
}

// output ports
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
audioOutPort.onLinkChanged = function ()
{
    // op.log("link changed");
    if (audioOutPort.isLinked())
    {
        setSyncAndAutostart();
    }
};

// clean up
op.onDelete = function ()
{
    node.dispose();
};
