CABLES.WEBAUDIO.createAudioContext(op);

// constants / defaults
let TYPES = [
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
let VALUES_DEFAULT = [];
let TYPE_DEFAULT = "up";

let node = new Tone.CtrlPattern(VALUES_DEFAULT, TYPE_DEFAULT);

// inputs
let triggerPort = op.inTrigger("Trigger");
let valuesPort = op.inArray("Values");
let typePort = op.addInPort(new CABLES.Port(op, "Type", CABLES.OP_PORT_TYPE_VALUE, { "display": "dropdown", "values": TYPES }));

// output
let triggerNextPort = op.outTrigger("Trigger Next");
let valuePort = op.outValue("Value");
let indexPort = op.outValue("Index");

// change listeners
valuesPort.onChange = function ()
{
    node.set("values", valuesPort.get() || VALUES_DEFAULT);
};
typePort.onTriggered = function ()
{
    let t = typePort.get();
    if (t && TYPES.indexOf(t) > -1)
    {
        node.set("type", t);
    }
};
triggerPort.onTriggered = function ()
{
    node.next();
    indexPort.set(node.index);
    valuePort.set(node.value);
    triggerNextPort.trigger();
};
