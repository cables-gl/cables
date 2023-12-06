const
    val = op.inValueFloat("Value"),
    outCurrent = op.outNumber("Current Value"),
    outOldVal = op.outNumber("Previous Value");

let oldValue = 0;

val.onChange = function ()
{
    outOldVal.set(oldValue);
    oldValue = val.get();
    outCurrent.set(val.get());
};
