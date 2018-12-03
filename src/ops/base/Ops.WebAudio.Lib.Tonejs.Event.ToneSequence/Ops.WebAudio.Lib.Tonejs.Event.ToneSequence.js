op.name="ToneSequence";

CABLES.WEBAUDIO.createAudioContext(op);

// defaults
var SUBDIVISION_DEFAULT = "4n";
var NOTE_SEQUENCE_DEFAULT = ["C4", "E4", "G4", "A4"];
var START_TIME_DEFAULT = "0";
var START_OFFSET_DEFAULT = "0";
var STOP_TIME_DEFAULT = "0";
var HUMANIZE_DEFAULT = false;
var HUMANIZE_TIME_DEFAULT = 0.02;
var MUTE_DEFAULT = false;
var PROBABILITY_DEFAULT = 1.0;

// vars
var node = new Tone.Sequence(eventCb, NOTE_SEQUENCE_DEFAULT, SUBDIVISION_DEFAULT);

// input ports
var subdivisionPort = op.inValueString("Subdivision");
subdivisionPort.set(SUBDIVISION_DEFAULT);
var sequencePort = op.inArray("Note Sequence");
sequencePort.set(NOTE_SEQUENCE_DEFAULT);
var startPort = op.addInPort( new CABLES.Port( this, "Start",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
var startOffsetPort = op.inValueString("Start Offset", START_OFFSET_DEFAULT);
var stopPort = op.addInPort( new CABLES.Port( this, "Stop",CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" } ));
var stopTimePort = op.inValueString("Stop Time", STOP_TIME_DEFAULT);
var humanizePort = op.addInPort( new CABLES.Port( op, "Humanize", CABLES.OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
humanizePort.set(HUMANIZE_DEFAULT);
var humanizeTimePort = op.inValue("Humanize Time");
humanizeTimePort.set(HUMANIZE_TIME_DEFAULT);
var mutePort = op.addInPort( new CABLES.Port( op, "Mute", CABLES.OP_PORT_TYPE_VALUE, { display: 'bool' } ) );
mutePort.set(MUTE_DEFAULT);
var probabilityPort = op.inValueSlider("Probability");
probabilityPort.set(PROBABILITY_DEFAULT);

// output ports
var eventTriggerPort = op.outTrigger("Event Trigger");
var timePort = op.outValue("Time");
var notePort = op.outValue("Note");

// change listeners
subdivisionPort.onChange = function() {
    createNewSequenceObject();
};
sequencePort.onChange = function() {
    createNewSequenceObject();
};
startPort.onTriggered = start;
stopPort.onTriggered = function() {
    var stopTime = CABLES.WEBAUDIO.isValidToneTime(stopTimePort.get()) ? stopTimePort.get() : STOP_TIME_DEFAULT;
    node.stop(stopTime);
};
humanizePort.onChange = function() {
    node.humanize = humanizePort.get() ? true : false;
};
humanizeTimePort.onChange = function() {
    var humanizeTime = humanizeTimePort.get();    
    if(humanizePort.get() && CABLES.WEBAUDIO.isValidToneTime(humanizeTime)) {
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
function createNewSequenceObject() {
    var subdivision = subdivisionPort.get();
    var sequence = sequencePort.get() || [];
    
    if(CABLES.WEBAUDIO.isValidToneTime(subdivision)) {
        var playedBefore = node.state === 'started' ? true : false;
        node.dispose(); // remove old instance
        node = new Tone.Sequence(eventCb, sequence, subdivision);
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

// gets called by the Sequence node
function eventCb(time, note) {
    timePort.set(time);
    notePort.set(note);
    eventTriggerPort.trigger();
}

function start() {
    var startTime = CABLES.WEBAUDIO.isValidToneTime(startTimePort.get()) ? startTimePort.get() : START_TIME_DEFAULT;
    var startOffset = CABLES.WEBAUDIO.isValidToneTime(startOffsetPort.get()) ? startOffsetPort.get() : START_OFFSET_DEFAULT;
    node.start(startTime, startOffset);
}