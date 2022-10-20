const
    interval = op.inValue("interval"),
    trigger = op.outTrigger("trigger"),
    active = op.inValueBool("Active", true);

active.onChange = function ()
{
    if (!active.get())
    {
        clearTimeout(timeOutId);
        timeOutId = -1;
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
