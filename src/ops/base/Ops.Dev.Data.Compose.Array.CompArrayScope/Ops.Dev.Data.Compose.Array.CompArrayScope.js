const
    update = op.inTriggerButton("Update"),
    active = op.inBool("Active", true),
    clear = op.inBool("Clear", true),
    inReset = op.inTriggerButton("Reset"),
    outScope = op.outScopeArea(),
    next = op.outTrigger("Next");

inReset.onTriggered = () =>
{
    arr = [];
    outArr.setRef([]);
};

let arr = [];

op.on("delete", () =>
{
    console.log("delede", op.tempData);
    if (op.tempData.scopeAreaEndOp) op.patch.deleteOp(op.tempData.scopeAreaEndOp.id);
});

update.onTriggered = () =>
{
    if (!active.get()) return next.trigger();

    op.patch.tempData.compArray = op.patch.tempData.compArray || [];

    if (clear.get()) arr = [];

    op.patch.tempData.compArray.push(arr);

    next.trigger();

    outScope.setRef({ "arr": arr });

};
