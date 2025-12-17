const
    exec = op.inTrigger("Trigger"),
    inTitle = op.inString("Title", ""),
    inActive = op.inBool("Active", true),
    next = op.outTrigger("Next");

inTitle.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inTitle.get() });
};

exec.onTriggered = () =>
{
    if (!inActive.get()) return next.trigger();

    gui.corePatch().startStepDebug();
    op.patch.tempData.continueStepDebugLog = op.patch.tempData.continueStepDebugLog || [];

    op.patch.tempData.continueStepDebugLog.push({
        "time": performance.now(),
        "port": exec,
        "action": "Start stepDebugTrigger " + inTitle.get()
    });

    next.trigger();
    gui.corePatch().stopStepDebug();
};
