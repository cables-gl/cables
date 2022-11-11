const
    inArrays = op.inArray("Array of Arrays"),
    index = op.inValueInt("Index"),
    result = op.outArray("Result Array");

inArrays.onChange =
index.onChange = update;

function update()
{
    let theArray = inArrays.get();
    if (!theArray)
    {
        result.set(null);
        return;
    }

    let ind = Math.floor(index.get());
    if (ind < 0 || ind > theArray.length - 1)
    {
        result.set(null);
        op.log("index wrong");
        return;
    }

    result.set(null);
    result.set(theArray[ind]);
}
