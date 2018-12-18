var array=op.inArray("array");
var index=op.inValueInt("index");
var value=op.outValue("value");

array.ignoreValueSerialize=true;

index.onChange=update;
array.onChange=update;

function update()
{
    if(array.get()) value.set( array.get()[index.get()]);
}
