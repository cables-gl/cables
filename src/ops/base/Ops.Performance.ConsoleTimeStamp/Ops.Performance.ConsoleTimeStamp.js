const
    inExec = op.inTrigger("Execute"),
    inLabel = op.inString("Label", "cables"),
    inTrack = op.inString("Track", "cables"),
    inGroup = op.inString("Track Group", ""),
    inColor = op.inDropDown("Color", ["primary", "primary-light", "primary-dark", "secondary", "secondary-light", "secondary-dark", "tertiary", "tertiary-light", "tertiary-dark", "error", "warning"], "primary"),
    outNext = op.outTrigger("Next");

inExec.onTriggered = () =>
{
    const start = performance.now();
    outNext.trigger();
    console.timeStamp(inLabel.get(), start, performance.now(), inTrack.get() || undefined, inGroup.get() || undefined, inColor.get());
};
