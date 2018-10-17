var array=op.inArray("Array");
var index=op.inValueInt("index");

var value=op.outValueString("String");

array.ignoreValueSerialize=true;

function update()
{
    if(array.get()) value.set( array.get()[index.get()]);
}

index.onChange=update;
array.onChange=update;
