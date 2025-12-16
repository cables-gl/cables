const
    inBool = op.inBool("Boolean", false),

    rTrue = op.inValueSlider("R True", Math.random()),
    gTrue = op.inValueSlider("G True", Math.random()),
    bTrue = op.inValueSlider("B True", Math.random()),
    aTrue = op.inValueSlider("A True", 1),
    rFalse = op.inValueSlider("R False", Math.random()),
    gFalse = op.inValueSlider("G False", Math.random()),
    bFalse = op.inValueSlider("B False", Math.random()),
    aFalse = op.inValueSlider("A False", 1),
    resultR = op.outNumber("R", 0),
    resultG = op.outNumber("G", 0),
    resultB = op.outNumber("B", 0),
    resultA = op.outNumber("A", 1);

rTrue.setUiAttribs({ "colorPick": true });
rFalse.setUiAttribs({ "colorPick": true });

rTrue.onChange =
    rFalse.onChange =
    gTrue.onChange =
    gFalse.onChange =
    bTrue.onChange =
    bFalse.onChange =
    inBool.onChange = update;

function update()
{
    if (inBool.get())
    {
        resultR.set(rTrue.get());
        resultG.set(gTrue.get());
        resultB.set(bTrue.get());
        resultA.set(aTrue.get());
    }
    else
    {
        resultR.set(rFalse.get());
        resultG.set(gFalse.get());
        resultB.set(bFalse.get());
        resultA.set(aFalse.get());
    }
}
