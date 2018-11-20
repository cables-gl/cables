const
    array=op.inArray("array"),
    outLength=op.outValue("length");

outLength.ignoreValueSerialize=true;

function update()
{
    var l=0;
    if(array.get()) l=array.get().length;
    else l=-1;
    outLength.set(l);
}

array.onChange=update;
