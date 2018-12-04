const
    value = op.inValue('Value'),
    result = op.outValue('Result');

value.onChange = function()
{
    var val = value.get() * 999;
    var direction = Math.round( Math.max(Math.min(val, 1), -1) );
    result.set( direction );
};

