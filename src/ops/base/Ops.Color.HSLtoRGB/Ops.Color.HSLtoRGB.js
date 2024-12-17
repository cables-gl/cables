const
    inH = op.inFloat("Hue", 0.5),
    inS = op.inFloat("Saturation", 1),
    inL = op.inFloat("Lightness", 0.5),
    outR = op.outNumber("R"),
    outG = op.outNumber("G"),
    outB = op.outNumber("B");

inH.onChange =
inS.onChange =
inL.onChange = () =>
{
    const rgb = chroma(inH.get() * 360, inS.get(), inL.get(), "hsl").rgb();

    outR.set(rgb[0] / 255);
    outG.set(rgb[1] / 255);
    outB.set(rgb[2] / 255);
};
