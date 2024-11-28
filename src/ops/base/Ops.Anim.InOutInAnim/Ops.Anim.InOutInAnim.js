const anim = new CABLES.Anim();

const
    update = op.inTrigger("Update"),

    duration2 = op.inValue("Duration In", 0.25),
    easing2 = anim.createPort(op, "Easing In"),
    value2 = op.inValue("Value In", 1),

    holdDuration = op.inValue("Hold duration", 0.0),

    duration1 = op.inValue("Duration Out", 0.25),
    easing1 = anim.createPort(op, "Easing Out"),
    value1 = op.inValue("Value Out", 0),

    trigger = op.inTriggerButton("Start"),

    next = op.outTrigger("Next"),
    outVal = op.outNumber("Result", 0),
    started = op.outTrigger("Started"),
    middle = op.outTrigger("Middle"),
    finished = op.outTrigger("finished");

op.setPortGroup("Out Anim", [duration1, easing1, value1]);
op.setPortGroup("In Anim", [duration2, easing2, value2]);

let time = 0;
trigger.onTriggered = setupAnim;

update.onTriggered = function ()
{
    time = CABLES.now() / 1000.0;
    if (anim.isStarted(time)) outVal.set(anim.getValue(time));
    else outVal.set(value2.get());

    next.trigger();
};

value2.onChange = function ()
{
    outVal.set(value2.get());
};

function setupAnim()
{
    anim.clear();
    // start
    anim.setValue(time, value2.get(), function ()
    {
        started.trigger();
    });

    const dur1 = duration1.get() || 0.001;
    const dur2 = duration2.get() || 0.001;
    // attack
    anim.setValue(time +
                        dur1, value1.get(), function ()
    {

    });
    // Hold
    anim.setValue(time +
                        dur1 + holdDuration.get(), value1.get(), function ()
    {
        middle.trigger();
    });
    // release
    anim.setValue(time +
                        dur1 +
                        dur2 + holdDuration.get(), value2.get(), function ()
    {
        finished.trigger();
    });

    anim.keys[0].setEasing(
        anim.easingFromString(easing1.get()));

    anim.keys[2].setEasing(
        anim.easingFromString(easing2.get()));
}
