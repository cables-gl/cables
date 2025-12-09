op.name = "IntervalAnim";

let exe = op.addInPort(new CABLES.Port(op, "exe", CABLES.OP_PORT_TYPE_FUNCTION));
let trigger = op.outTrigger("trigger");
let interval = op.addInPort(new CABLES.Port(op, "Interval", CABLES.OP_PORT_TYPE_VALUE));
let delay = op.addInPort(new CABLES.Port(op, "Delay", CABLES.OP_PORT_TYPE_VALUE));
let percent = op.addOutPort(new CABLES.Port(op, "percent"));

let anim = new CABLES.Anim();
anim.setValue(1, 1);
anim.setValue(2, 2);
anim.loop = true;
anim.onLooped = function ()
{
    trigger.trigger();
};

delay.set(0);
delay.onChange = setAnim;
interval.onChange = setAnim;
interval.set(1);

let startTime = CABLES.now();

function setAnim()
{
    anim.keys[0].time = delay.get();
    anim.keys[0].value = 0;
    anim.keys[1].time = delay.get() + interval.get();
    anim.keys[1].value = 1;
    startTime = CABLES.now();
}

exe.onTriggered = function ()
{
    let now = (CABLES.now() - startTime) / 1000;
    let perc = anim.getValue(now);

    percent.set(perc);
};
