const
    update = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    outArr = op.outObject("Result");

update.onTriggered = () =>
{
    op.patch.frameStore.compObject = op.patch.frameStore.compObject || [];

    let obj = {};
    op.patch.frameStore.compObject.push(obj);
    next.trigger();

    outArr.setRef(op.patch.frameStore.compObject.pop());
};
