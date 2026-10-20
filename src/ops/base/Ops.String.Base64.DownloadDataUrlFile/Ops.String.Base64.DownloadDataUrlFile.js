const
    inStr = op.inString("Data URL", "default"),
    inFilename = op.inString("Filename"),
    exec = op.inTriggerButton("Download"),
    next = op.outTrigger("Next");

exec.onTriggered = () =>
{
    const a = document.createElement("a");
    a.setAttribute("download", "download");
    a.href = inStr.get();

    a.download = inFilename.get();
    a.click();
};
