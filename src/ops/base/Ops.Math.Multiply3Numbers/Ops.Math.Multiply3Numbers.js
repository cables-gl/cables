const
    inR = op.inFloat("R", 0),
    inG = op.inFloat("G", 0),
    inB = op.inFloat("B", 0),

    inMul = op.inFloat("Multiply", 1),

    outR = op.outNumber("ResultR", 0),
    outG = op.outNumber("ResultG", 0),
    outB = op.outNumber("ResultB", 0);

inR.onChange =
inG.onChange =
inB.onChange =
inMul.onChange = () =>
{
    const m = inMul.get();
    outR.set(inR.get() * m);
    outG.set(inG.get() * m);
    outB.set(inB.get() * m);
};
