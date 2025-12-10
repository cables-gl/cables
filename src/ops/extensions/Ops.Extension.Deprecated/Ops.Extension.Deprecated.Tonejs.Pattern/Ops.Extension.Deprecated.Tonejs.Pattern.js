CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let NOTE_SEQUENCE_DEFAULT = ["C4", "E4", "G4", "A4"];
let START_TIME_DEFAULT = "0";
let STOP_TIME_DEFAULT = "0";
let HUMANIZE_DEFAULT = false;
let HUMANIZE_TIME_DEFAULT = 0.02;
let MUTE_DEFAULT = false;
let PROBABILITY_DEFAULT = 1.0;
let PATTERN_TYPES = [
    "up",
    "down",
    "upDown",
    "downUp",
    "alternateUp",
    "alternateDown",
    "random",
    "randomWalk",
    "randomOnce"
];
let PATTERN_TYPE_DEFAULT = "upDown";
let INTERVAL_DEFAULT = "4n";

// vars
let node = new Tone.Pattern(eventCb, NOTE_SEQUENCE_DEFAULT, PATTERN_TYPE_DEFAULT);

// input ports
let intervalPort = op.inValueString("Interval");
intervalPort.set(INTERVAL_DEFAULT);
let valuesPort = op.inArray("Note Values");
valuesPort.set(NOTE_SEQUENCE_DEFAULT);
let patternTypePort = op.addInPort(new CABLES.Port(op, "Pattern Type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": PATTERN_TYPES }));
patternTypePort.set(PATTERN_TYPE_DEFAULT);
let startPort = op.addInPort(new CABLES.Port(this, "Start", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
let stopPort = op.addInPort(new CABLES.Port(this, "Stop", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
let humanizePort = op.addInPort(new CABLES.Port(op, "Humanize", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
humanizePort.set(HUMANIZE_DEFAULT);
let humanizeTimePort = op.inValue("Humanize Time");
humanizeTimePort.set(HUMANIZE_TIME_DEFAULT);
let mutePort = op.addInPort(new CABLES.Port(op, "Mute", CABLES.OP_PORT_TYPE_VALUE, { "display": "bool" }));
mutePort.set(MUTE_DEFAULT);
let probabilityPort = op.inValueSlider("Probability");
probabilityPort.set(PROBABILITY_DEFAULT);

// output ports
let eventTriggerPort = op.outTrigger("Event Trigger");
let timePort = op.outValue("Time");
let notePort = op.outValue("Note");

// change listeners
intervalPort.onChange = function ()
{
    setNodeValue("interval", intervalPort.get());
};
valuesPort.onChange = function ()
{
    op.log("Setting values to: ", valuesPort.get());
    setNodeValue("values", valuesPort.get());
    op.log("Values set to: ", node.values);
};
patternTypePort.onChange = function ()
{
    if (PATTERN_TYPES.indexOf(patternTypePort.get()) > -1)
    {
        setNodeValue("pattern", patternTypePort.get());
    }
};
startPort.onTriggered = start;
stopPort.onTriggered = function ()
{
    let stopTime = CABLES.WEBAUDIO.isValidToneTime(stopTimePort.get()) ? stopTimePort.get() : STOP_TIME_DEFAULT;
    node.stop(stopTime);
};
humanizePort.onChange = function ()
{
    node.humanize = !!humanizePort.get();
};
humanizeTimePort.onChange = function ()
{
    let humanizeTime = humanizeTimePort.get();
    if (humanizePort.get() && CABLES.WEBAUDIO.isValidToneTime(humanizeTime))
    {
        node.humanize = humanizeTime;
    }
};
mutePort.onChange = function ()
{
    node.mute = !mutePort.get();
};
probabilityPort.onChange = function ()
{
    node.probability = probabilityPort.get();
};

// functions
function setNodeValue(key, val)
{
    if (typeof val !== "undefined")
    {
        try
        {
            node.set(key, val);
        }
        catch (e) { op.log(e); }
    }
}

/*
function createNewPatternObject() {
    var interval = intervalPort.get();
    var sequence = valuesPort.get() || [];

    if(CABLES.WEBAUDIO.isValidToneTime(interval)) {
        var playedBefore = node.state === 'started' ? true : false;
        node.dispose(); // remove old instance
        node = new Tone.Sequence(eventCb, sequence, interval);
        if(humanizePort.get()) {
            var humanizeTime = humanizeTimePort.get();
            if(CABLES.WEBAUDIO.isValidToneTime(humanizeTime)) {
                node.humanize = humanizeTime;
            } else {
                node.humanize = true;
            }
        }
        node.probability = probabilityPort.get();
        node.mute = mutePort.get();
        if(playedBefore) {
            start();
        }
    }
}
*/

// gets called by the Sequence node
function eventCb(time, note)
{
    timePort.set(time);
    notePort.set(note);
    eventTriggerPort.trigger();
}

function start()
{
    let startTime = CABLES.WEBAUDIO.isValidToneTime(startTimePort.get()) ? startTimePort.get() : START_TIME_DEFAULT;
    node.start(startTime);
}
