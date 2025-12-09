CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let SUBDIVISION_DEFAULT = "4n";
let NOTE_SEQUENCE_DEFAULT = ["C4", "E4", "G4", "A4"];
let START_TIME_DEFAULT = "0";
let START_OFFSET_DEFAULT = "0";
let STOP_TIME_DEFAULT = "0";
let HUMANIZE_DEFAULT = false;
let HUMANIZE_TIME_DEFAULT = 0.02;
let MUTE_DEFAULT = false;
let PROBABILITY_DEFAULT = 1.0;

// vars
let node = new Tone.Sequence(eventCb, NOTE_SEQUENCE_DEFAULT, SUBDIVISION_DEFAULT);

// input ports
let subdivisionPort = op.inValueString("Subdivision");
subdivisionPort.set(SUBDIVISION_DEFAULT);
let sequencePort = op.inArray("Note Sequence");
sequencePort.set(NOTE_SEQUENCE_DEFAULT);
let startPort = op.addInPort(new CABLES.Port(this, "Start", CABLES.OP_PORT_TYPE_FUNCTION, { "display": "button" }));
let startTimePort = op.inValueString("Start Time", START_TIME_DEFAULT);
let startOffsetPort = op.inValueString("Start Offset", START_OFFSET_DEFAULT);
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
subdivisionPort.onChange = function ()
{
    createNewSequenceObject();
};
sequencePort.onChange = function ()
{
    createNewSequenceObject();
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
function createNewSequenceObject()
{
    let subdivision = subdivisionPort.get();
    let sequence = sequencePort.get() || [];

    if (CABLES.WEBAUDIO.isValidToneTime(subdivision))
    {
        let playedBefore = node.state === "started";
        node.dispose(); // remove old instance
        node = new Tone.Sequence(eventCb, sequence, subdivision);
        if (humanizePort.get())
        {
            let humanizeTime = humanizeTimePort.get();
            if (CABLES.WEBAUDIO.isValidToneTime(humanizeTime))
            {
                node.humanize = humanizeTime;
            }
            else
            {
                node.humanize = true;
            }
        }
        node.probability = probabilityPort.get();
        node.mute = mutePort.get();
        if (playedBefore)
        {
            start();
        }
    }
}

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
    let startOffset = CABLES.WEBAUDIO.isValidToneTime(startOffsetPort.get()) ? startOffsetPort.get() : START_OFFSET_DEFAULT;
    node.start(startTime, startOffset);
}
