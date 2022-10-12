// inputs
let inPort1 = op.inArray("Array 1");
let inPort2 = op.inArray("Array 2");
let chunkSizePort = op.inValue("Chunk Size", 1);

// outputs
let outPort = op.outArray("Combined Array");

// change listeners
inPort1.onChange = update;
inPort2.onChange = update;
chunkSizePort.onChange = update;

// functions

function update()
{
    let newArr = [];
    let arr1 = inPort1.get();
    let arr2 = inPort2.get();

    let chunkSize = chunkSizePort.get();
    if (chunkSize < 1)
    {
        chunkSize = 1;
        // TODO: Show warning in gui!?
    }
    // array 2 is empty -> just use array 1
    if (arr1 && !arr2)
    {
        newArr = arr1.slice(0);
    }
    // array 1 is empty -> just use array 2
    if (!arr1 && arr2) // normally else if
    {
        newArr = arr2.slice(0);
    }

    // array 1 and 2 are not empty -> combine them
    else if (arr1 && arr2)
    {
        for (let i = 0; i < Math.max(arr1.length, arr2.length); i += chunkSize)
        {
            for (let j = 0; j < chunkSize && j + i < arr1.length; j++)
            {
                newArr.push(arr1[i + j]);
            }
            for (let k = 0; k < chunkSize && k + i < arr2.length; k++)
            {
                newArr.push(arr2[i + k]);
            }
        }
    }
    outPort.set(null);
    outPort.set(newArr);
}
