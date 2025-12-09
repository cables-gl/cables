CABLES.WEBAUDIO.createAudioContext(op);

// defaults
let SMOOTHING_DEFAULT = 0.8;
let SMOOTHING_MIN = 0.0; // ?
let SMOOTHING_MAX = 1.0; // ?

// vars
let node = new Tone.Meter(SMOOTHING_DEFAULT);

// inputs
let audioInPort = CABLES.WEBAUDIO.createAudioInPort(op, "Audio In", node);
let updateValuePort = op.inTrigger("Update Value");
let updateDecibelsPort = op.inTrigger("Update Decibels");
let smoothingPort = op.inValueSlider("Smoothing");
smoothingPort.set(SMOOTHING_DEFAULT);

// change listeners
updateValuePort.onTriggered = function ()
{
    valuePort.set(node.getValue());
};

updateDecibelsPort.onTriggered = function ()
{
    decibelsPort.set(node.getLevel());
};

smoothingPort.onChange = function ()
{
    let smoothing = smoothingPort.get();
    if (smoothing && smoothing >= SMOOTHING_MIN && smoothing <= SMOOTHING_MAX)
    {
        node.set("smoothing", smoothing);
    }
};

// outputs
let audioOutPort = CABLES.WEBAUDIO.createAudioOutPort(op, "Audio Out", node);
var valuePort = op.outValue("Value");
var decibelsPort = op.outValue("Decibels");
valuePort.set(0);
