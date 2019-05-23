const passThrough = op.inValueBool('Pass Through',true),
    arrayIn = op.inArray('Array in'),
    arrayOut = op.outArray('Array Out');

arrayIn.onChange = passThrough.onChange = function()
{
    if(passThrough.get())
    {
        arrayOut.set(arrayIn.get());
    }
    else
    {
        arrayOut.set(null);
    }
}
