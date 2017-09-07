op.name="Pattern";

CABLES.WebAudio.createAudioContext(op);

// defaults
var NOTE_SEQUENCE_DEFAULT = ["C4", "E4", "G4", "A4"];
var START_TIME_DEFAULT = "0";
var STOP_TIME_DEFAULT = "0";
var HUMANIZE_DEFAULT = false;
var HUMANIZE_TIME_DEFAULT = 0.02;
var MUTE_DEFAULT = false;
var PROBABILITY_DEFAULT = 1.0;
var PATTERN_TYPES = [
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
var PATTERN_TYPE_DEFAULT = "upDown";
var INTERVAL_DEFAULT = "4n";

// vars
var node = new Tone.Pattern(eventCb, NOTE_SEQUENCE_DEFAULT, PATTERN_TYPE_DEFAULT);

// input ports
var intervalPort = op.inValueString("Interval");
intervalPort.set(INTERVAL_DEFAULT);
var valuesPort = op.inArray("Note Values");
valuesPort.set(NOTE_SEQUENCE_DEFAULT);
var patternTypePort = op.addInPort( new Port( op, "Pattern Type", OP_PORT_TYPE_VALUE, { display: 'dropdown', values: PATTERN_TYPES } ) );
patternTypePort.set(PATTERN_TYPE_DEFAULT);
var startPort = op.addInPort( new Port( this, "Start", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
var stopPort = op.addInPort( new Port( this, "Stop", OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
var humanizePort = op.addInPort( new Port( op, "Humanize", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
humanizePort.set(HUMANIZE_DEFAULT);
var humanizeTimePort = op.inValue("Humanize Time");
humanizeTimePort.set(HUMANIZE_TIME_DEFAULT);
var mutePort = op.addInPort( new Port( op, "Mute", OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
mutePort.set(MUTE_DEFAULT);
var probabilityPort = op.inValueSlider("Probability");
probabilityPort.set(PROBABILITY_DEFAULT);

// output ports
var eventTriggerPort = op.outFunction("Event Trigger");
var timePort = op.outValue("Time");
var notePort = op.outValue("Note");

// change listeners
intervalPort.onChange = function() {
    setNodeValue("interval", intervalPort.get());
};
valuesPort.onChange = function() {
    op.log("Setting values to: ", valuesPort.get());
    setNodeValue("values", valuesPort.get());
    op.log("Values set to: ", node.values);
};
patternTypePort.onChange = function() {
    if(PATTERN_TYPES.indexOf(patternTypePort.get()) > -1) {
        setNodeValue("pattern", patternTypePort.get());    
    }
};
startPort.onTriggered = start;
stopPort.onTriggered = function() {
    var stopTime = CABLES.WebAudio.isValidToneTime(stopTimePort.get()) ? stopTimePort.get() : STOP_TIME_DEFAULT;
    node.stop(stopTime);
};
humanizePort.onChange = function() {
    node.humanize = humanizePort.get() ? true : false;
};
humanizeTimePort.onChange = function() {
    var humanizeTime = humanizeTimePort.get();    
    if(humanizePort.get() && CABLES.WebAudio.isValidToneTime(humanizeTime)) {
        node.humanize = humanizeTime;    
    }
};
mutePort.onChange = function() {
    node.mute = mutePort.get() ? false : true;
};
probabilityPort.onChange = function() {
    node.probability = probabilityPort.get();
};

// functions
function setNodeValue(key, val) {
    if(typeof val !== 'undefined') {
        try{
            node.set(key, val);
        } catch(e) { op.log(e); }
    }
}

/*
function createNewPatternObject() {
    var interval = intervalPort.get();
    var sequence = valuesPort.get() || [];
    
    if(CABLES.WebAudio.isValidToneTime(interval)) {
        var playedBefore = node.state === 'started' ? true : false;
        node.dispose(); // remove old instance
        node = new Tone.Sequence(eventCb, sequence, interval);
        if(humanizePort.get()) {
            var humanizeTime = humanizeTimePort.get();
            if(CABLES.WebAudio.isValidToneTime(humanizeTime)) {
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
function eventCb(time, note) {
    timePort.set(time);
    notePort.set(note);
    eventTriggerPort.trigger();
}

function start() {
    var startTime = CABLES.WebAudio.isValidToneTime(startTimePort.get()) ? startTimePort.get() : START_TIME_DEFAULT;
    node.start(startTime);
}