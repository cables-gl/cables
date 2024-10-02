const
    inR = op.inFloatSlider("R", 0),
    inG = op.inFloatSlider("G", 0),
    inB = op.inFloatSlider("B", 0),
    outC = op.outNumber("C"),
    outM = op.outNumber("M"),
    outY = op.outNumber("Y"),
    outK = op.outNumber("K");

inR.setUiAttribs({ "colorPick": true });

inR.onChange =
inG.onChange =
inB.onChange = () =>
{
    const cmyk = chroma(inR.get() * 255, inG.get() * 255, inB.get() * 255, "rgb").cmyk();
    outC.set(cmyk[0]);
    outM.set(cmyk[1]);
    outY.set(cmyk[2]);
    outK.set(cmyk[3]);
};
