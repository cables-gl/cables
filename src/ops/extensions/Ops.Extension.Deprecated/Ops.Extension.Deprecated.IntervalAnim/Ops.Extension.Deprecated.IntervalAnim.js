const exe = op.inTrigger("exe");
const interval = op.inValue("Interval");
const delay = op.inValue("Delay");
const percent = op.outValue("percent");
const trigger = op.outTrigger("Trigger");

const anim = new CABLES.Anim();
anim.setValue(1, 1);
anim.setValue(2, 2);
anim.setValue(3, 3);
anim.loop = true;

delay.set(0);
interval.set(1);
delay.onChange = setAnim;
interval.onChange = setAnim;

let startTime = CABLES.now();
exe.onTriggered = setoutValue;

let lastValue = -1;

function setAnim()
{
    let del = delay.get();
    anim.keys[0].time = 0;
    anim.keys[0].value = 0;
    anim.keys[1].time = del;
    anim.keys[1].value = 0;
    anim.keys[2].time = del + interval.get();
    anim.keys[2].value = 1;
}

function setoutValue()
{
    let now = (CABLES.now() - startTime) / 1000;
    let perc = anim.getValue(now);
    percent.set(perc);
    if (perc < lastValue) trigger.trigger();
    lastValue = perc;
}
