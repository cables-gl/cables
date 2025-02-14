const
    array = op.inArray("array"),
    index = op.inValueInt("index"),
    result = op.outString("result");

array.ignoreValueSerialize = true;

array.onChange =
index.onChange = update;

function update()
{
    const arr = array.get();
    if (arr) result.set(arr[index.get()]);
}
