const
    inCopy = op.inTriggerButton("Copy"),
    inStr = op.inString("String", "cablez"),
    outSuccess = op.outBoolNum("Success");

inCopy.onTriggered = () =>
{
    op.setUiError("err", null);

    navigator.clipboard.writeText(inStr.get())
        .then(() =>
        {
            outSuccess.set(true);
        })
        .catch((e) =>
        {
            op.setUiError("err", e.message);
            outSuccess.set(false);
        });
};
