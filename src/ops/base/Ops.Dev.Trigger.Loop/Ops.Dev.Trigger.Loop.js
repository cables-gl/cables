const
    exe = op.inTrigger("Execute"),
    inCount = op.inInt("Count", 5),
    outScope = op.outScopeArea(),
    next = op.outTrigger("Next"),
    outIndex = op.outNumber("Index");

op.setUiAttrib({ "allowStacking": true });

const scopeData = { "count": 0 };

op.on("delete", () =>
{
    if (op.tempData.scopeAreaEndOp) op.patch.deleteOp(op.tempData.scopeAreaEndOp.id);
});

op.on("areaChildrenChange", updateStacks);
op.onLoaded = updateStacks;
inCount.onChange = updateStacks;
updateStacks();

function updateStacks()
{
    op.stackCount = Math.max(0, Math.floor(inCount.get()));
    op.updateAreaStacks();
}

exe.onTriggered = () =>
{
    const count = Math.max(0, Math.floor(inCount.get()));

    for (let i = 0; i < count; i++)
    {
        op.patch.pushLoopIndex(i);
        outIndex.set(i);
        next.trigger();
        op.patch.popLoopIndex();
    }

    scopeData.count = count;
    outScope.setRef(scopeData);
};
