let inArrays = op.inArray("Array of Arrays");
let index = op.inValueInt("Index");

let result = op.outArray("Result Array");

inArrays.onChange = update;
index.onChange = update;

function update()
{
    let theArray = inArrays.get();
    if (!theArray)
    {
        result.set(null);
        // op.log('no array');
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
