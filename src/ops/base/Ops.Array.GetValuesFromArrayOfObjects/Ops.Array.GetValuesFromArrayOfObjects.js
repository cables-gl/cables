const
    inArr = op.inArray("Array"),
    inKey = op.inString("Key"),
    inignoreNonNums = op.inBool("Numbers Only", false),
    inRemoveInvalid = op.inBool("Remove empty/invalid", false),
    outArray = op.outArray("Result");

inRemoveInvalid.onChange =
inKey.onChange =
inArr.onChange =
inignoreNonNums.onChange = exec;

inKey.setUiAttribs({ "stringTrim": true, "minLength": 1 });

function exec()
{
    const arr = inArr.get();

    if (!arr)
    {
        outArray.set(null);
        return;
    }

    const newArr = [];
    const key = inKey.get();
    const numsonly = inignoreNonNums.get();

    op.setUiAttrib({ "extendTitle": inKey.get() });

    const removeInvalid = inRemoveInvalid.get();

    for (let i = 0; i < arr.length; i++)
    {
        const obj = arr[i];

        if (obj)
        {
            if (!(key in obj)) continue;

            const v = obj[key];

            if (removeInvalid)
            {
                if (v === "" ||
                    v === null ||
                    v === undefined

                ) continue;
            }

            if (numsonly)
            {
                if (CABLES.isNumeric(v)) newArr.push(parseFloat(v));
                else newArr.push(0);
            }
            else
            {
                newArr.push(v);
            }
        }
    }

    outArray.setRef(newArr);
}
