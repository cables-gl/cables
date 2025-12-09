CABLES.WEBAUDIO.createAudioContext(op);

// constants
let INTERVAL_DEFAULT = "4n";
let PLAYBACK_RATE_DEFAULT = 1;
let PLAYBACK_RATE_MIN = 0.0001; // ?
let PLAYBACK_RATE_MAX = 100; // ?
let HUMANIZE_TIME_DEFAULT = 0.01;
let PROBABILITY_DEFAULT = 1;
let PROBABILITY_MIN = 0;
let PROBABILITY_MAX = 1;
let START_TIME_DEFAULT = "0"; // start at start of timeline
let STOP_TIME_DEFAULT = "+0"; // stop immediately
let CANCEL_TIME_DEFAULT = "+0"; // cancel immediately
let ITERATIONS_DEFAULT = 0;
let MUTE_DEFAULT = false;

// vars
let node = new Tone.Loop(cb, INTERVAL_DEFAULT);
op.log("iterations: ", node.get("iterations"));

// input ports
let updateStatePorts = op.inTrigger("Update State Ports");
updateStatePorts.onLinkChanged = checkAutoStart;
let intervalPort = op.inValueString("Interval", INTERVAL_DEFAULT);
let iterationsPort = op.inValue("Iterations", ITERATIONS_DEFAULT);
let playbackRatePort = op.inValue("Playback Rate", PLAYBACK_RATE_DEFAULT);
let humanizePort = op.inValueBool("Humanize", false);
let humanizeTimePort = op.inValueString("Humanize Time", HUMANIZE_TIME_DEFAULT);
let probabilityPort = op.inValueSlider("Probability", PROBABILITY_DEFAULT);
let startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
let startTriggerPort = op.inTriggerButton("Start");
let autoStartPort = op.inValueBool("Auto Start", true);
let stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
let stopTriggerPort = op.inTriggerButton("Stop");
let cancelTimePort = op.inValueString("Cancel Time", CANCEL_TIME_DEFAULT);
let cancelTriggerPort = op.inTriggerButton("Cancel");
let mutePort = op.inValueBool("Mute", MUTE_DEFAULT);

// functions

// check autostart - automatically starts the loop when autostart is set,
// uses start time from startTimePort
function checkAutoStart()
{
    op.log("checking autostart");
    let autoStart = autoStartPort.get();
    let startTime = startTimePort.get();
    if (!CABLES.WEBAUDIO.isValidToneTime(startTime))
    {
        startTime = START_TIME_DEFAULT;
        op.log("Warning: Start time is not a valid tone time, using: ", START_TIME_DEFAULT);
    }
    if (autoStart && node.get("state") !== "started")
    {
        node.start(startTime);
    }
}

// the callback invoked by Tone.Loop
function cb(time)
{
    timePort.set(time);
    triggerPort.trigger();
}

function start(startTime)
{
    if (node.state !== "started")
    {
        if (CABLES.WEBAUDIO.isValidToneTime(startTime))
        {
            node.start(startTime);
        }
        else
        {
            op.log("Warning: Start time is not a valid tone time, starting now");
            node.start("+0");
        }
    }
}

function stop(stopTime)
{
    if (node.state !== "stopped")
    {
        if (CABLES.WEBAUDIO.isValidToneTime(stopTime))
        {
            node.stop(stopTime);
        }
        else
        {
            op.log("Warning: Stop time is not a valid tone time, stopping now");
            node.stop("+0");
        }
    }
}

// change listeners
intervalPort.onChange = function ()
{
    let interval = intervalPort.get();
    if (CABLES.WEBAUDIO.isValidToneTime(interval))
    {
        node.set("interval", interval);
    }
};

startTriggerPort.onTriggered = function ()
{
    let startTime = startTimePort.get();
    if (!CABLES.WEBAUDIO.isValidToneTime(startTime))
    {
        startTime = START_TIME_DEFAULT;
        op.log("Warning: Start time is not a valid tone time, using: ", START_TIME_DEFAULT);
    }
    start(startTime);
};

stopTriggerPort.onTriggered = function ()
{
    let stopTime = stopTimePort.get();
    if (!CABLES.WEBAUDIO.isValidToneTime(stopTime))
    {
        stopTime = STOP_TIME_DEFAULT;
        op.log("Warning: Stop time is not a valid tone time, using: ", STOP_TIME_DEFAULT);
    }
    stop(stopTime);
};

cancelTriggerPort.onTriggered = function ()
{
    let cancelTime = cancelTimePort.get();
    if (!CABLES.WEBAUDIO.isValidToneTime(cancelTime))
    {
        cancelTime = CANCEL_TIME_DEFAULT;
        op.log("Warning: Cancel time is not a valid tone time, using: ", CANCEL_TIME_DEFAULT);
    }
    node.cancel(cancelTime);
};

iterationsPort.onChange = function ()
{
    let iterations = iterationsPort.get();
    let iterationsF;
    try
    {
        iterationsF = parseInt(iterations);
    }
    catch (e)
    {
        iterationsF = Infinity;
    }
    if (iterationsF <= 0) { iterationsF = Infinity; }
    node.set("iterations", iterationsF);
};

mutePort.onChange = function ()
{
    let mute = !!mutePort.get();
    node.set("mute", mute);
};

playbackRatePort.onChange = function ()
{
    let playbackRate = playbackRatePort.get();
    if (playbackRate < PLAYBACK_RATE_MIN)
    {
        playbackRate = PLAYBACK_RATE_MIN;
    }
    else if (playbackRate > PLAYBACK_RATE_MAX)
    {
        playbackRate = PLAYBACK_RATE_MAX;
    }
    node.set("playbackRate", playbackRate);
};

probabilityPort.onChange = function ()
{
    let probability = probabilityPort.get();
    if (probability >= PROBABILITY_MIN && probability <= PROBABILITY_MAX)
    {
        node.set("probability", probability);
    }
};

function handleHumanizeChange()
{
    let humanizeTime = humanizeTimePort.get();
    let humanize = humanizePort.get();
    if (humanize)
    {
        if (CABLES.WEBAUDIO.isValidToneTime(humanizeTime))
        {
            node.set("humanize", humanizeTime);
        }
        else
        {
            op.log("Warning: Humanize Time is not a valid tone time");
        }
    }
    else
    {
        node.set("humanize", false);
    }
}

humanizePort.onChange = handleHumanizeChange;
humanizeTimePort.onChange = handleHumanizeChange;

updateStatePorts.onTriggered = function ()
{
    startedPort.set(node.get("state").state === "started");
    progressPort.set(node.get("progress").progress);
};

// output ports
var triggerPort = op.outTrigger("Trigger");
triggerPort.onLinkChanged = checkAutoStart;
var timePort = op.outValue("Time");
timePort.onLinkChanged = checkAutoStart;
var startedPort = op.outValue("Started");
var progressPort = op.outValue("Progress");

// clean up
op.onDelete = function ()
{
    node.dispose();
};
