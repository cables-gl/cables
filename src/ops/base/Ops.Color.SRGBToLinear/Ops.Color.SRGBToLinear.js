const
    inR = op.inFloatSlider("R", 0),
    inG = op.inFloatSlider("G", 0),
    inB = op.inFloatSlider("B", 0),
    outR = op.outNumber("Linear R"),
    outG = op.outNumber("Linear G"),
    outB = op.outNumber("Linear B");

inR.setUiAttribs({ "colorPick": true });

inR.onChange =
    inG.onChange =
    inB.onChange = update;

update();

function toLinear(value)
{
    if (value <= 0.04045) return value / 12.92;
    return Math.pow((value + 0.055) / 1.055, 2.4);
}

function update()
{
    outR.set(toLinear(inR.get()));
    outG.set(toLinear(inG.get()));
    outB.set(toLinear(inB.get()));
}
