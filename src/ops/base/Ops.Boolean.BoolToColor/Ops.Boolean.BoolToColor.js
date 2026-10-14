const
    inBool = op.inBool("Boolean", false),

    rTrue = op.inFloatSlider("R True", Math.random()),
    gTrue = op.inFloatSlider("G True", Math.random()),
    bTrue = op.inFloatSlider("B True", Math.random()),
    aTrue = op.inFloatSlider("A True", 1),
    rFalse = op.inFloatSlider("R False", Math.random()),
    gFalse = op.inFloatSlider("G False", Math.random()),
    bFalse = op.inFloatSlider("B False", Math.random()),
    aFalse = op.inFloatSlider("A False", 1),
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
