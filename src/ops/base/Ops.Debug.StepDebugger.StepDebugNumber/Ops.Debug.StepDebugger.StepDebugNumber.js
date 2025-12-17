const
    inNum = op.inFloat("Number"),
    inTitle = op.inString("Title", ""),
    inActive = op.inBool("Active", true),
    outNum = op.outNumber("Result");

inTitle.onChange = () =>
{
    op.setUiAttrib({ "extendTitle": inTitle.get() });
};

inNum.onChange = () =>
{
    if (!inActive.get()) return outNum.set(inNum.get());

    gui.corePatch().startStepDebug();
    op.patch.tempData.continueStepDebugLog = op.patch.tempData.continueStepDebugLog || [];
    op.patch.tempData.continueStepDebugLog.push({
        "time": performance.now(),
        "action": "Start debug " + inTitle.get()
    });

    outNum.set(inNum.get());
    gui.corePatch().stopStepDebug();
};
