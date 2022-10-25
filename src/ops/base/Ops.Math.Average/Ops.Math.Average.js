const
    number = op.inValue("number"),
    infl = op.inValueSlider("Influence", 0.2),
    result = op.outNumber("result");

number.onChange = function ()
{
    let influence = infl.get();
    result.set((result.get() * (1.0 - influence) + number.get()) * influence);
};

number.set(1);
