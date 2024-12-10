const
    update = op.inTrigger("Update"),
    inNum1 = op.inFloat("X", 0),
    inNum2 = op.inFloat("Y", 0),
    inNum3 = op.inFloat("Z", 0),
    inNum4 = op.inFloat("W", 1),
    inNum = op.inSwitch("Num", ["1", "2", "3", "4"], "4"),
    next = op.outTrigger("Next");

// inSwitch.onChange=updateUi;

let num = 4;

inNum.onChange = () =>
{
    num = parseInt(inNum.get());
    inNum2.setUiAttribs({ "greyout": num < 2 });
    inNum3.setUiAttribs({ "greyout": num < 3 });
    inNum4.setUiAttribs({ "greyout": num < 4 });
};

function updateUi()
{
    inDivisorDown.setUiAttribs({ "greyout": false });
}

update.onTriggered = () =>
{
    if (op.patch.tempData.compArray && op.patch.tempData.compArray.length > 0)
    {
        let arr = op.patch.tempData.compArray[op.patch.tempData.compArray.length - 1];
        if (arr)
        {
            if (num == 4) arr.push(inNum1.get(), inNum2.get(), inNum3.get(), inNum4.get());
            else if (num == 3) arr.push(inNum1.get(), inNum2.get(), inNum3.get());
            else if (num == 2) arr.push(inNum1.get(), inNum2.get());
            else if (num == 1) arr.push(inNum1.get());
        }
    }
    next.trigger();
};
