// Op.apply(this, arguments);
let self = this;

this.patch.loadLib("leap-motion");

this.name = "LeapMotion";

let leapFrame = this.addOutPort(new CABLES.Port(this, "leapFrame", CABLES.OP_PORT_TYPE_OBJECT));
leapFrame.ignoreValueSerialize = true;

let numHands = this.addOutPort(new CABLES.Port(this, "num Hands"));

Leap.loop(function (frame)
{
    numHands.set(frame.hands.length);

    leapFrame.set(frame);
});
