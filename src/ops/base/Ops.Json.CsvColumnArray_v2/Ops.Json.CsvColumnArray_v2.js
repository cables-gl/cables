const
    colName = op.inString("Column Name", "name"),
    inArr = op.inArray("CSV Array"),
    inNumbers = op.inBool("Numbers", false),
    result = op.outArray("Result");

colName.onChange =
inNumbers.onChange =
    inArr.onChange = update;

function update()
{
    let iArr = inArr.get();
    let iName = colName.get();

    if (!iArr)
    {
        result.set(null);
        return;
    }

    op.setUiError("notfound", null);
    op.setUiError("notnum", null);

    if (iArr[0] && iArr[0].hasOwnProperty(iName))
    {
        let arr = [];

        let hasStrings = false;

        if (inNumbers.get())
        {
            for (let i = 0; i < iArr.length; i++)
            {
                let n = Number(iArr[i][iName] || 0);
                arr.push(n);
                if (!CABLES.isNumeric(iArr[i][iName]))
                {
                    hasStrings = true;
                }
            }

            if (hasStrings)
            {
                op.setUiError("notnum", "Parse Error / Not all values numerical!");
            }
        }
        else
        {
            for (let i = 0; i < iArr.length; i++)
                arr.push(iArr[i][iName]);
        }
        result.set(arr);
    }
    else
        op.setUiError("notfound", "Column not found");
}
