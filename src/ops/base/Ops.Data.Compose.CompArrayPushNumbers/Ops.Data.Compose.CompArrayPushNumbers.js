const
    update = op.inTrigger("Update"),
    // inNum=op.inSwitch("Num",["1","2","3","4"],"3"),
    inNum1 = op.inFloat("X", 0),
    inNum2 = op.inFloat("Y", 0),
    inNum3 = op.inFloat("Z", 0),
    inNum4 = op.inFloat("W", 1),
    next = op.outTrigger("Next");

// inSwitch.onChange=updateUi;

function updateUi()
{
    // inNum4.setUiAttribs
    inDivisorDown.setUiAttribs({ "greyout": false });
}

update.onTriggered = () =>
{
    if (op.patch.frameStore.compArray && op.patch.frameStore.compArray.length > 0)
    {
        let arr = op.patch.frameStore.compArray[op.patch.frameStore.compArray.length - 1];
        if (arr) arr.push(inNum1.get(), inNum2.get(), inNum3.get(), inNum4.get());
    }
    next.trigger();
};
