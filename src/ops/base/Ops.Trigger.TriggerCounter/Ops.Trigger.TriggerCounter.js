const
    exe = op.inTriggerButton("exe"),
    reset = op.inTriggerButton("reset"),
    trigger = op.outTrigger("trigger"),
    num = op.outNumber("timesTriggered");

/* minimalcore:start */
op.toWorkPortsNeedToBeLinked(exe);
op.setUiAttrib({ "extendTitle": 0 });

/* minimalcore:end */
let n = 0;

reset.onTriggered =
    op.onLoaded =
    doReset;

exe.onTriggered = function ()
{
    n++;
    num.set(n);

    /* minimalcore:start */
    op.setUiAttrib({ "extendTitle": n });

    /* minimalcore:end */
    trigger.trigger();
};

function doReset()
{
    n = 0;

    /* minimalcore:start */

    op.setUiAttrib({ "extendTitle": n });

    /* minimalcore:end */

    num.set(n);
}
