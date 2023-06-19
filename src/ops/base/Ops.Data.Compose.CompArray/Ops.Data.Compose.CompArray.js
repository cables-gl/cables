const
    update = op.inTrigger("Update"),
    next = op.outTrigger("Next"),
    outArr = op.outArray("Result");

update.onTriggered = () =>
{
    op.patch.frameStore.compArray = op.patch.frameStore.compArray || [];

    let arr = [];
    op.patch.frameStore.compArray.push(arr);
    next.trigger();

    outArr.setRef(op.patch.frameStore.compArray.pop());
};
