let array = op.inArray("Array");
let index = op.inValueInt("index");

let value = op.outValueString("String");

array.ignoreValueSerialize = true;

function update()
{
    if (array.get()) value.set(array.get()[index.get()]);
}

index.onChange = update;
array.onChange = update;
