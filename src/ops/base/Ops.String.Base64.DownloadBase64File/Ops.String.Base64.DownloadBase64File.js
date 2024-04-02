// welcome to your new op!
// have a look at the documentation:
// https://cables.gl/docs/5_writing_ops/dev_ops/dev_ops

const
    inStr = op.inString("Data URL", "default"),
    inFilename = op.inString("Filename"),
    exec = op.inTriggerButton("Download"),
    next = op.outTrigger("Next");

exec.onTriggered = () =>
{
    const a = document.createElement("a"); // Create <a>

    a.href = inStr.get();

    a.download = inFilename.get(); // File name Here
    a.click(); // Downloaded file
};
