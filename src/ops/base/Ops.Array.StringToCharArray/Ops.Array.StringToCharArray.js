const
    strIn = op.inString("String", "test"),
    convertToNumbersBool = op.inBool("Convert to numbers", false),
    arrOut = op.outArray("Array out");

const arr = [];

strIn.onChange = convertToNumbersBool.onChange = update;

update();

function update()
{
    const str = strIn.get();
    if (str !== undefined && str !== null)
    {
        const strLength = str.length;

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
        arrOut.setRef(arr);
    }
    else
    {
        op.setUiError("null", "input is not of type string");
        arrOut.setRef(null);
    }
}
