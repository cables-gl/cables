const
    inR = op.inFloatSlider("Linear R", 0),
    inG = op.inFloatSlider("Linear G", 0),
    inB = op.inFloatSlider("Linear B", 0),
    outR = op.outNumber("R"),
    outG = op.outNumber("G"),
    outB = op.outNumber("B");

inR.setUiAttribs({ "colorPick": true });

inR.onChange =
    inG.onChange =
    inB.onChange = update;

update();

function toSrgb(value)
{
    if (value <= 0.0031308) return value * 12.92;
    return 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

function update()
{
    outR.set(toSrgb(inR.get()));
    outG.set(toSrgb(inG.get()));
    outB.set(toSrgb(inB.get()));
}
