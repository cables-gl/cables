const
    strIn = op.inString("String", "test"),
    convertToNumbersBool = op.inBool("Convert to numbers", false),
    arrOut = op.outArray("Array out");

const arr = [];

function update()
{
    const strLength = strIn.get().length;
    const str = strIn.get();

    arr.length = 0;
    arr.length = strLength;
    if (convertToNumbersBool.get())
    {
        for (let i = 0; i < strLength; i++)
        {
            arr[i] = str.charCodeAt(i);
        }
    }
    else
    {
        for (let i = 0; i < strLength; i++)
        {
            arr[i] = str.charAt(i);
        }
    }

    arrOut.set(null);
    arrOut.set(arr);
}

update();
strIn.onChange = convertToNumbersBool.onChange = update;
