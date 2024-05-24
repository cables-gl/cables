const
    interval = op.inValue("interval"),
    trigger = op.outTrigger("trigger"),
    active = op.inValueBool("Active", true);

active.onChange = function ()
{
    clearTimeout(timeOutId);
    timeOutId = -1;

    if (!active.get())
    {
    }
    else exec();
};

interval.set(1000);
let timeOutId = -1;

function exec()
{
    if (!active.get()) return;
    if (timeOutId != -1) return;

    timeOutId = setTimeout(function ()
    {
        timeOutId = -1;
        trigger.trigger();
        exec();
    },
    interval.get());
}

interval.onChange = exec;

exec();
