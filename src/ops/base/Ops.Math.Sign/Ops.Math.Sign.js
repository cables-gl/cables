const
    value = op.inValue('Value'),
    noZeroIn = op.inBool("Remove zero",false),
    result = op.outValue('Result');

value.onChange = function()
{
    var direction=0;
    var val = value.get() * 999;
    var noZero = noZeroIn.get();

    if(!noZero)
    {
        direction = Math.round( Math.max(Math.min(val, 1), -1) );
    }
    else
    {
        direction = (val<0)?-1:1;
    }
    result.set( direction );
};

