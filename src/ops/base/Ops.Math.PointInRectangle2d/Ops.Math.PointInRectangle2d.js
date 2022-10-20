const
    x = op.inValue("x"),
    y = op.inValue("y"),

    rtop = op.inValue("rect top"),
    rleft = op.inValue("rect left"),
    rright = op.inValue("rect right"),
    rbottom = op.inValue("rect bottom"),

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
