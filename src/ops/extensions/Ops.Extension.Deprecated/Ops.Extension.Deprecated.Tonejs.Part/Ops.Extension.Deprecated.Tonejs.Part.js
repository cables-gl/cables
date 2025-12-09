CABLES.WEBAUDIO.createAudioContext(op);

// constants
let PLAYBACK_RATE_DEFAULT = 1;
let PLAYBACK_RATE_MIN = 0.0001; // ?
let PLAYBACK_RATE_MAX = 100; // ?
let HUMANIZE_TIME_DEFAULT = 0.01;
let PROBABILITY_DEFAULT = 1;
let PROBABILITY_MIN = 0;
let PROBABILITY_MAX = 1;
let START_TIME_DEFAULT = "0"; // start at start of timeline
let AUTO_START_DEFAULT = true;
let STOP_TIME_DEFAULT = "+0"; // stop immediately
let CANCEL_TIME_DEFAULT = "+0"; // cancel immediately
let MUTE_DEFAULT = false;
let LOOP_START_DEFAULT = "0";
let LOOP_END_DEFAULT = "1m";
let LOOP_DEFAULT = false;
let ITERATIONS_DEFAULT = 0;
let TIME_NOTE_ARRAY_DEFAULT =
[
    {
        "time": "0",
        "note": "C3",
        "velocity": 0.9
    },
    {
        "time": "0:2",
        "note": "C4",
        "velocity": 0.5
    }
];

// vars
let node = new Tone.Part(cb, TIME_NOTE_ARRAY_DEFAULT);

// input ports
let updateStatePorts = op.inTrigger("Update State Ports");
updateStatePorts.onLinkChanged = checkAutoStart;
let timeNoteArrayPort = op.addInPort(new CABLES.Port(op, "Time & Note Array", CABLES.OP_PORT_TYPE_ARRAY, { "type": "string", "display": "editor" }));
timeNoteArrayPort.set(JSON.stringify(TIME_NOTE_ARRAY_DEFAULT, null, 4));
let loopPort = op.inValueBool("Loop", LOOP_DEFAULT);
let iterationsPort = op.inValue("Loop Iterations", ITERATIONS_DEFAULT);
let loopStartPort = op.inValueString("Loop Start", LOOP_START_DEFAULT);
let loopEndPort = op.inValueString("Loop End", LOOP_END_DEFAULT);
let playbackRatePort = op.inValue("Playback Rate", PLAYBACK_RATE_DEFAULT);
let humanizePort = op.inValueBool("Humanize", false);
let humanizeTimePort = op.inValueString("Humanize Time", HUMANIZE_TIME_DEFAULT);
let probabilityPort = op.inValueSlider("Probability", PROBABILITY_DEFAULT);
let startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
let startTriggerPort = op.inTriggerButton("Start");
let autoStartPort = op.inValueBool("Auto Start", AUTO_START_DEFAULT);
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
function cb(time, value)
{
    timePort.set(time);
    if (value)
    {
        if (value.note) notePort.set(value.note);
        if (value.velocity) velocityPort.set(value.velocity);
    }
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

timeNoteArrayPort.onChange = function ()
{
    let arrStr = timeNoteArrayPort.get();
    let arr = [];
    try
    {
        arr = JSON.parse(arrStr);
    }
    catch (e) { op.log("Could not parse Time & Note Array, maybe you forgot a comma!?", e); }
    node.removeAll();
    if (arr.length)
    {
        for (let i = 0; i < arr.length; i++)
        {
            if (arr[i] && typeof arr[i].time !== "undefined" && typeof arr[i].note !== "undefined" && typeof arr[i].velocity !== "undefined")
            {
                node.add(arr[i].time, arr[i]);
            }
        }
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

loopStartPort.onChange = function ()
{
    let loopStart = loopStartPort.get();
    if (CABLES.WEBAUDIO.isValidToneTime(loopStart))
    {
        node.set("loopStart", loopStart);
    }
    else
    {
        op.log("Warning: Loop Start Time is not a valid tone time: ", loopStart);
    }
};

loopEndPort.onChange = function ()
{
    let loopEnd = loopEndPort.get();
    if (CABLES.WEBAUDIO.isValidToneTime(loopEnd))
    {
        node.set("loopEnd", loopEnd);
    }
    else
    {
        op.log("Warning: Loop End Time is not a valid tone time: ", loopEnd);
    }
};

loopPort.onChange = function ()
{
    let loop = loopPort.get();
    let iterations = iterationsPort.get();
    if (loop)
    {
        if (iterations >= 0)
        {
            node.set("loop", iterations);
        }
        else
        {
            op.log("Warning: Part will not trigger because loop is set and loop-iterations <= 0");
        }
    }
    else
    {
        node.set("loop", false);
    }
};

iterationsPort.onChange = function ()
{
    let loop = loopPort.get();
    if (!loop) { return; }
    let iterations = iterationsPort.get();
    let iterationsN;
    try
    {
        iterationsN = parseInt(iterations);
    }
    catch (e)
    {
        iterationsN = ITERATIONS_DEFAULT;
        op.log("Warning: Invalid iterations, using: ", ITERATIONS_DEFAULT);
    }
    if (iterationsN <= 0)
    {
        iterationsN = ITERATIONS_DEFAULT;
        op.log("Warning: Invalid iterations, using: ", ITERATIONS_DEFAULT);
    }
    node.set("loop", iterationsN);
};

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
var notePort = op.outValue("Note");
notePort.onLinkChanged = checkAutoStart;
var velocityPort = op.outValue("Velocity");
velocityPort.onLinkChanged = checkAutoStart;
var startedPort = op.outValue("Started");
var progressPort = op.outValue("Progress");

// clean up
op.onDelete = function ()
{
    node.dispose();
};
