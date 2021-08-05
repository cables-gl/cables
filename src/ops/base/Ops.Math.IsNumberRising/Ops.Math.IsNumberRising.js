const
    inNum = op.inFloat("Number", 0),
    outRising = op.outNumber("Rising");

let last = 0;

inNum.onChange = () =>
{
    outRising.set(inNum.get() > last);
    last = inNum.get();
};
