const
    array=op.inArray("array"),
    index=op.inValueInt("index"),
    value=op.outValue("value");

array.ignoreValueSerialize=true;

index.onChange=array.onChange=update;

function update()
{
    if(array.get())
    {
        var input=array.get()[index.get()];
        if(isNaN(input))
        {
            value.set(NaN);
            return;
        }
        value.set(input);
    }
}
