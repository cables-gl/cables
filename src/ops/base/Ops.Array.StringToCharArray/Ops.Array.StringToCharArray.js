const
    strIn = op.inString("String", "test"),
    convertToNumbersBool = op.inBool("Convert to numbers", false),
    arrOut = op.outArray("Array out");

const arr = [];

function update()
{
    const str = strIn.get();
    if (str !== undefined && str !== null)
    {
        const strLength = str.length;

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

        op.setUiError("null", null);
        arrOut.set(null);
        arrOut.set(arr);
    }
    else
    {
        op.setUiError("null", "input is not of type string");
        arrOut.set(null);
    }
}

update();
strIn.onChange = convertToNumbersBool.onChange = update;
