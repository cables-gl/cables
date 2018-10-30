op.name="AudioLoop";

CABLES.WEBAUDIO.createAudioContext(op);

// constants
var INTERVAL_DEFAULT = "4n";
var PLAYBACK_RATE_DEFAULT = 1;
var PLAYBACK_RATE_MIN = 0.0001; // ?
var PLAYBACK_RATE_MAX = 100; // ?
var HUMANIZE_TIME_DEFAULT = 0.01;
var PROBABILITY_DEFAULT = 1;
var PROBABILITY_MIN = 0;
var PROBABILITY_MAX = 1;
var START_TIME_DEFAULT = "0"; // start at start of timeline
var STOP_TIME_DEFAULT = "+0"; // stop immediately
var CANCEL_TIME_DEFAULT = "+0"; // cancel immediately
var ITERATIONS_DEFAULT = 0;
var MUTE_DEFAULT = false;

// vars
var node = new Tone.Loop(cb, INTERVAL_DEFAULT);
op.log("iterations: ", node.get("iterations"));

// input ports
var updateStatePorts = op.inTrigger("Update State Ports");
updateStatePorts.onLinkChanged = checkAutoStart;
var intervalPort = op.inValueString("Interval", INTERVAL_DEFAULT);
var iterationsPort = op.inValue("Iterations", ITERATIONS_DEFAULT);
var playbackRatePort = op.inValue("Playback Rate", PLAYBACK_RATE_DEFAULT);
var humanizePort = op.inValueBool("Humanize", false);
var humanizeTimePort = op.inValueString("Humanize Time", HUMANIZE_TIME_DEFAULT);
var probabilityPort = op.inValueSlider("Probability", PROBABILITY_DEFAULT);
var startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
var startTriggerPort = op.inFunctionButton("Start");
var autoStartPort = op.inValueBool("Auto Start", true);
var stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
var stopTriggerPort = op.inFunctionButton("Stop");
var cancelTimePort = op.inValueString("Cancel Time", CANCEL_TIME_DEFAULT);
var cancelTriggerPort = op.inFunctionButton("Cancel");
var mutePort = op.inValueBool("Mute", MUTE_DEFAULT);

// functions

// check autostart - automatically starts the loop when autostart is set,
// uses start time from startTimePort
function checkAutoStart() {
    op.log("checking autostart");
    var autoStart = autoStartPort.get();
    var startTime = startTimePort.get();
    if(!CABLES.WEBAUDIO.isValidToneTime(startTime)) {
        startTime = START_TIME_DEFAULT;
        op.log("Warning: Start time is not a valid tone time, using: ", START_TIME_DEFAULT);
    }
    if(autoStart && node.get("state") !== 'started') {
        node.start(startTime);
    }
}

// the callback invoked by Tone.Loop
function cb(time) {
    timePort.set(time);
    triggerPort.trigger();
}

function start(startTime) {
    if(node.state !== 'started') {
        if(CABLES.WEBAUDIO.isValidToneTime(startTime)) {
            node.start(startTime);    
        } else {
            op.log("Warning: Start time is not a valid tone time, starting now");
            node.start("+0");    
        }
        
    }
}

function stop(stopTime) {
    if(node.state !== 'stopped') {
        if(CABLES.WEBAUDIO.isValidToneTime(stopTime)) {
            node.stop(stopTime);    
        } else {
            op.log("Warning: Stop time is not a valid tone time, stopping now");
            node.stop("+0");
        }
        
    }
}

// change listeners
intervalPort.onChange = function() {
    var interval = intervalPort.get();
    if(CABLES.WEBAUDIO.isValidToneTime(interval)) {
        node.set("interval", interval);
    }
};

startTriggerPort.onTriggered = function() {
    var startTime = startTimePort.get();
    if(!CABLES.WEBAUDIO.isValidToneTime(startTime)) {
        startTime = START_TIME_DEFAULT;
        op.log("Warning: Start time is not a valid tone time, using: ", START_TIME_DEFAULT);
    }
    start(startTime);
};

stopTriggerPort.onTriggered = function() {
    var stopTime = stopTimePort.get();
    if(!CABLES.WEBAUDIO.isValidToneTime(stopTime)) {
        stopTime = STOP_TIME_DEFAULT;
        op.log("Warning: Stop time is not a valid tone time, using: ", STOP_TIME_DEFAULT);
    }
    stop(stopTime);
};

cancelTriggerPort.onTriggered = function() {
    var cancelTime = cancelTimePort.get();
    if(!CABLES.WEBAUDIO.isValidToneTime(cancelTime)) {
        cancelTime = CANCEL_TIME_DEFAULT;
        op.log("Warning: Cancel time is not a valid tone time, using: ", CANCEL_TIME_DEFAULT);
    }
    node.cancel(cancelTime);
};

iterationsPort.onChange = function() {
    var iterations = iterationsPort.get();
    var iterationsF;
    try {
        iterationsF = parseInt(iterations);
    } catch(e) {
        iterationsF = Infinity;
    }
    if(iterationsF <= 0) { iterationsF = Infinity; }
    node.set("iterations", iterationsF);    
};

mutePort.onChange = function() {
    var mute = mutePort.get() ? true : false;
    node.set("mute", mute);
};

playbackRatePort.onChange = function() {
    var playbackRate = playbackRatePort.get();
    if(playbackRate < PLAYBACK_RATE_MIN) {
        playbackRate = PLAYBACK_RATE_MIN;
    } else if(playbackRate > PLAYBACK_RATE_MAX) {
        playbackRate = PLAYBACK_RATE_MAX;
    }
    node.set("playbackRate", playbackRate);
};

probabilityPort.onChange = function() {
    var probability = probabilityPort.get();
    if(probability >= PROBABILITY_MIN && probability <= PROBABILITY_MAX) {
        node.set("probability", probability);
    }
};

function handleHumanizeChange() {
    var humanizeTime = humanizeTimePort.get();
    var humanize = humanizePort.get();
    if(humanize) {
        if(CABLES.WEBAUDIO.isValidToneTime(humanizeTime)) {
            node.set("humanize", humanizeTime);
        } else {
            op.log("Warning: Humanize Time is not a valid tone time");
        }
    } else {
        node.set("humanize", false);
    }
}

humanizePort.onChange = handleHumanizeChange;
humanizeTimePort.onChange = handleHumanizeChange;

updateStatePorts.onTriggered = function() {
    startedPort.set(node.get("state").state === 'started');
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
op.onDelete = function() {
    node.dispose();
};