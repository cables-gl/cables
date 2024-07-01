// Op.apply(this, arguments);

this.name = "leap finger";

this.patch.loadLib("leap-motion");

let leapFrame = this.addInPort(new CABLES.Port(this, "leap frame", CABLES.OP_PORT_TYPE_OBJECT));
leapFrame.ignoreValueSerialize = true;

let handIndex = this.addInPort(new CABLES.Port(this, "hand index"));
let fingerIndex = this.addInPort(new CABLES.Port(this, "finger index"));

handIndex.set(0);
fingerIndex.set(0);

let btipX = this.addOutPort(new CABLES.Port(this, "btip x"));
let btipY = this.addOutPort(new CABLES.Port(this, "btip y"));
let btipZ = this.addOutPort(new CABLES.Port(this, "btip z"));

let tipX = this.addOutPort(new CABLES.Port(this, "tip x"));
let tipY = this.addOutPort(new CABLES.Port(this, "tip y"));
let tipZ = this.addOutPort(new CABLES.Port(this, "tip z"));

let pipX = this.addOutPort(new CABLES.Port(this, "pip x"));
let pipY = this.addOutPort(new CABLES.Port(this, "pip y"));
let pipZ = this.addOutPort(new CABLES.Port(this, "pip z"));

let jointX = this.addOutPort(new CABLES.Port(this, "joint x"));
let jointY = this.addOutPort(new CABLES.Port(this, "joint y"));
let jointZ = this.addOutPort(new CABLES.Port(this, "joint z"));

let carpX = this.addOutPort(new CABLES.Port(this, "carpal x"));
let carpY = this.addOutPort(new CABLES.Port(this, "carpal y"));
let carpZ = this.addOutPort(new CABLES.Port(this, "carpal z"));

leapFrame.onValueChange(function ()
{
    let frame = leapFrame.get();
    if (frame.hands.length > handIndex.get())
    {
        let hand = frame.hands[handIndex.get()];

        if (hand.fingers.length > fingerIndex.get())
        {
            let finger = hand.fingers[fingerIndex.get()];

            // https://developer.leapmotion.com/documentation/javascript/devguide/Intro_Skeleton_API.html

            tipX.set(finger.dipPosition[0]);
            tipY.set(finger.dipPosition[1]);
            tipZ.set(finger.dipPosition[2]);

            // if(finger.tipPosition)
            {
                btipX.set(finger.tipPosition[0]);
                btipY.set(finger.tipPosition[1]);
                btipZ.set(finger.tipPosition[2]);
            }

            pipX.set(finger.pipPosition[0]);
            pipY.set(finger.pipPosition[1]);
            pipZ.set(finger.pipPosition[2]);

            jointX.set(finger.mcpPosition[0]);
            jointY.set(finger.mcpPosition[1]);
            jointZ.set(finger.mcpPosition[2]);

            carpX.set(finger.carpPosition[0]);
            carpY.set(finger.carpPosition[1]);
            carpZ.set(finger.carpPosition[2]);
        }
    }
});
