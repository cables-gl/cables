CABLES.WEBAUDIO.createAudioContext(op);

// constants
let PLAYBACK_RATE_DEFAULT = 1;
let PLAYBACK_RATE_MIN = 0.01; // ?
let PLAYBACK_RATE_MAX = 100; // ?
let TYPES = [
    "white",
    "brown",
    "pink"
];
let TYPE_DEFAULT = "white";
let VOLUME_DEFAULT = -6;
let MUTE_DEFAULT = false;
let START_DEFAULT = true;
let START_TIME_DEFAULT = "+0";
let STOP_TIME_DEFAULT = "+0";
let AUTO_START_DEFAULT = true;

// vars
let node = new Tone.Noise(TYPE_DEFAULT);

// inputs
let playbackRatePort = op.inValue("Playback Rate", PLAYBACK_RATE_DEFAULT);
let typePort = op.addInPort(new CABLES.Port(op, "Type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": TYPES }));
typePort.set(TYPE_DEFAULT);
let startPort = op.addInPort(new CABLES.Port(op, "Start", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
let stopPort = op.addInPort(new CABLES.Port(op, "Stop", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
let autoStartPort = op.inValueBool("Auto Start", AUTO_START_DEFAULT);
let volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);
let mutePort = op.addInPort(new CABLES.Port(op, "Mute", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
mutePort.set(MUTE_DEFAULT);

function checkAutostart()
{
    if (autoStartPort.get())
    {
        start();
    }
}

// init
op.onLoaded = checkAutostart;

// functions
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

// change listeners
playbackRatePort.onChange = function ()
{
    let playbackRate = playbackRatePort.get();
    if (playbackRate && playbackRate >= PLAYBACK_RATE_MIN && playbackRate <= PLAYBACK_RATE_MAX)
    {
        try
        {
            node.set("playbackRate", playbackRate);
        }
        catch (e)
        {
            op.log(e);
        }
    }
};

typePort.onChange = function ()
{
    let type = typePort.get();
    if (type && TYPES.indexOf(type) > -1)
    {
        node.type = type;
    }
};

startPort.onTriggered = function ()
{
    start();
};

stopPort.onTriggered = function ()
{
    stop();
};

autoStartPort.onChange = function ()
{
    op.log("autoStartPort changed: ", autoStartPort.get());
};

mutePort.onChange = function ()
{
    node.mute = !!mutePort.get();
};

// outputs
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);

audioOutPort.onLinkChanged = function ()
{
    if (audioOutPort.isLinked())
    {
        checkAutostart();
    }
};

// clean up
op.onDelete = function ()
{
    node.dispose();
};
