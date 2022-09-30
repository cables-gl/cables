const
    array = op.inArray("array"),
    index = op.inValueInt("index"),
    result = op.outString("result");

array.ignoreValueSerialize = true;

index.onChange = update;

array.onChange = function ()
{
    update();
};

function update()
{
    const arr = array.get();
    if (arr) result.set(arr[index.get()]);
}
