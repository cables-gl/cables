// defaults
let FREQUENCY_DEFAULT = 440;
let DETUNE_DEFAULT = 0;
let MODULATION_FREQUENCY_DEFAULT = 0.4;
let PHASE_DEFAULT = 0;
let PHASE_MIN = 0;
let PHASE_MAX = 180;
let VOLUME_DEFAULT = -6;
let MUTE_DEFAULT = false;
let SYNC_FREQUENCY_DEFAULT = false;
let START_DEFAULT = true;
let START_TIME_DEFAULT = "+0";
let STOP_TIME_DEFAULT = "+0";
let AUTO_START_DEFAULT = true;

// vars
let node = new Tone.PWMOscillator(FREQUENCY_DEFAULT, MODULATION_FREQUENCY_DEFAULT);

// input ports
let frequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Frequency", node.frequency, null, FREQUENCY_DEFAULT);
let detunePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Detune", node.detune, null, DETUNE_DEFAULT);
let modulationFrequencyPort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Modulation Frequency", node.modulationFrequency, null, MODULATION_FREQUENCY_DEFAULT);
let phasePort = op.addInPort(new CABLES.Port(op, "Phase", CABLES.OP_PORT_TYPE_VALUE, { "display": "range", "min": PHASE_MIN, "max": PHASE_MAX }));
phasePort.set(PHASE_DEFAULT);
let syncFrequencyPort = op.inValueBool("Sync Frequency", SYNC_FREQUENCY_DEFAULT);
let startPort = op.addInPort(new CABLES.Port(op, "Start", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
let stopPort = op.addInPort(new CABLES.Port(op, "Stop", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
let autoStartPort = op.inValueBool("Auto Start", AUTO_START_DEFAULT);
let volumePort = CABLES.WEBAUDIO.createAudioParamInPort(op, "Volume", node.volume, null, VOLUME_DEFAULT);
let mutePort = op.addInPort(new CABLES.Port(op, "Mute", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
mutePort.set(MUTE_DEFAULT);

// set defaults
node.set("frequency", FREQUENCY_DEFAULT);
node.set("detune", DETUNE_DEFAULT);
node.set("modulationFrequency", MODULATION_FREQUENCY_DEFAULT);
node.set("phase", PHASE_DEFAULT);
node.set("volume", VOLUME_DEFAULT);
node.set("mute", MUTE_DEFAULT);

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

autoStartPort.onChange = function ()
{
    op.log("autoStartPort changed: ", autoStartPort.get());
};

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

// change listeners
startPort.onTriggered = function ()
{
    start();
};

stopPort.onTriggered = function ()
{
    stop();
};

mutePort.onChange = function ()
{
    node.mute = !!mutePort.get();
};

syncFrequencyPort.onChange = function ()
{
    let sync = syncFrequencyPort.get();
    if (sync)
    {
        syncFrequency();
    }
    else
    {
        unsyncFrequency();
    }
};

phasePort.onChange = function ()
{
    let phase = phasePort.get();
    if (phase >= PHASE_MIN && phase <= PHASE_MAX)
    {
        node.set("phase", phase);
    }
};

// outputs
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
