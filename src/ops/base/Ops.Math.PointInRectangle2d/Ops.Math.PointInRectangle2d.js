const
    x = op.inFloat("x"),
    y = op.inFloat("y"),

    rtop = op.inFloat("rect top"),
    rleft = op.inFloat("rect left"),
    rright = op.inFloat("rect right"),
    rbottom = op.inFloat("rect bottom"),

    result = op.outBoolNum("Result"),
    outX = op.outNumber("Pos x"),
    outY = op.outNumber("Pos y");

x.onChange = y.onChange = function ()
{
    let isIn = (x.get() > rleft.get() && x.get() < rright.get() && y.get() > rtop.get() && y.get() < rbottom.get());

    outX.set(Math.max(0, Math.min(1.0, (x.get() - rleft.get()) / (rright.get() - rleft.get()))));
    outY.set(Math.max(0, Math.min(1.0, (y.get() - rtop.get()) / (rbottom.get() - rtop.get()))));

    result.set(isIn == true);
};
