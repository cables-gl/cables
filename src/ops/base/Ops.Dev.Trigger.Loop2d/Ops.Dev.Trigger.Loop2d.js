const
    exe = op.inTrigger("Execute"),
    inCountX = op.inInt("Num X", 5),
    inCountY = op.inInt("Num Y", 5),
    outScope = op.outScopeArea(),
    next = op.outTrigger("Next"),
    outIndex = op.outNumber("Index"),
    outIndexX = op.outNumber("X"),
    outIndexY = op.outNumber("Y");

op.setUiAttrib({ "allowStacking": true });

const scopeData = { "count": 0 };

op.on("delete", () =>
{
    if (op.tempData.scopeAreaEndOp) op.patch.deleteOp(op.tempData.scopeAreaEndOp.id);
});

op.on("areaChildrenChange", updateStacks);
op.onLoaded = updateStacks;
inCountX.onChange = updateStacks;
inCountY.onChange = updateStacks;
updateStacks();

function updateStacks()
{
    op.stackCount = Math.max(0, Math.floor(inCountX.get() * inCountY.get()));
    op.updateAreaStacks();
}

exe.onTriggered = () =>
{
    const countX = Math.max(0, Math.floor(inCountX.get()));
    const countY = Math.max(0, Math.floor(inCountY.get()));

    let i = 0;
    for (let x = 0; x < countX; x++)

        for (let y = 0; y < countY; y++)
        {
            op.patch.pushLoopIndex(i);
            outIndex.set(i);
            outIndexX.set(x);
            outIndexY.set(y);
            next.trigger();
            op.patch.popLoopIndex();
            i++;
        }

    scopeData.count = i - 1;
    outScope.setRef(scopeData);
};
