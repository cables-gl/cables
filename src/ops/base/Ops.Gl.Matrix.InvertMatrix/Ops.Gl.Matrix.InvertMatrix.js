const
    inMat = op.inArray("Matrix"),
    outMat = op.outArray("Result");

const m = mat4.create();

inMat.onChange = () =>
{
    if (!inMat.get()) return;
    mat4.invert(m, inMat.get());
    outMat.set(null);
    outMat.set(m);
};
