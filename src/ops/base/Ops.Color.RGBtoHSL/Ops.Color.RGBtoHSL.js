const
    inR = op.inFloat("R", 0.5),
    inG = op.inFloat("G", 1),
    inB = op.inFloat("B", 0.5),
    outH = op.outNumber("Hue"),
    outS = op.outNumber("Saturation"),
    outL = op.outNumber("Lightness");

inR.onChange =
inG.onChange =
inB.onChange = () =>
{
    const hsl = chroma(inR.get() * 255, inG.get() * 255, inB.get() * 255, "rgb").hsl();

    outH.set(hsl[0] / 360);
    outS.set(hsl[1]);
    outL.set(hsl[2]);
};
