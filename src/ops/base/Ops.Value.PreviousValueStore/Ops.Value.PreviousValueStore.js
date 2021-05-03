const
    val = op.inValueFloat("Value"),
    outCurrent = op.outValue("Current Value"),
    outOldVal = op.outValue("Previous Value");

let oldValue = 0;

val.onChange = function ()
{
    outOldVal.set(oldValue);
    oldValue = val.get();
    outCurrent.set(val.get());
};
