// Create a input port of the type Array
const inArr = op.inArray("Array in");

// Create a output port of the type Array
const outArray = op.outArray("Array out");

// cache for errors
let showingError = false;

// when array in changes call the function update
inArr.onChange = update;

// TODO revalute error checking code !!
function update()
{
    // create an array called 'tempArray' and assign
    // the array coming in to it
    let tempArray = inArr.get();

    // error checking section
    // check if arrays come in correctly on startup
    // if no array comes in just return to avoid errors
    if (!inArr)
    {
        return;
    }
    // set outArray to tempArray
    outArray.set(tempArray);
}
