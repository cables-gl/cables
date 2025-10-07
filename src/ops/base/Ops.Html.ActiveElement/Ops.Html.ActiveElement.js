// welcome to your new op!
// have a look at the documentation:
// https://cables.gl/docs/5_writing_ops/dev_ops/dev_ops

const
    exec = op.inTrigger("Trigger"),
    outele = op.outObject("Active Element");

let lastEle = null;
exec.onTriggered = () =>
{
    if (lastEle != document.activeElement)
    {
        lastEle = document.activeElement;
        outele.setRef(lastEle);
    }
};
