const
    array = op.inArray("array"),
    index = op.inValueInt("index"),
    result = op.outString("result");

array.ignoreValueSerialize = true;

index.onChange = update;
let arr = null;

array.onChange = function ()
{
    arr = array.get();
    update();
};

function update()
{
    if (arr) result.set(arr[index.get()]);
}
