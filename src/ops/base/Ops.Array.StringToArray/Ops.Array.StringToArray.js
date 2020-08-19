const
    strIn = op.inString("String", "test"),
    arrOut = op.outArray("Array out");

const arr = [];

function update()
{
    const strLength = strIn.get().length;
    const str = strIn.get();

    arr.length = 0;
    arr.length = strLength;

    for (let i = 0; i < strLength; i++)
    {
        arr[i] = str.charAt(i);
    }

    arrOut.set(null);
    arrOut.set(arr);
}

update();
strIn.onChange = update;
