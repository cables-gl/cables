const
    inString = op.inStringEditor("Input String", "1,2,3"),
    separator = op.inString("Separator", ","),
    splitNewLines = op.inBool("Split Lines", false),
    forceNumbers = op.inBool("Numbers", false),
    outArray = op.outArray("Result");

forceNumbers.onChange =
    separator.onChange =
    inString.onChange = exec;

exec();

splitNewLines.onChange = () =>
{
    separator.setUiAttribs({ "greyout": splitNewLines.get() });
    exec();
};

function exec()
{
    op.setUiError("notnum", null);

    let s = inString.get() || "";
    let arr;
    if (splitNewLines.get())arr = s.split("\n");
    else arr = s.split(separator.get());

    if (forceNumbers.get())
    {
        let hasStrings = false;
        const numbersArray = [];
        for (let i = 0; i < arr.length; i++)
        {
            const num = arr[i];
            if (num)
            {
                if (!CABLES.UTILS.isNumeric(num))
                {
                    hasStrings = true;
                    numbersArray.push(0);
                }
                else
                {
                    numbersArray.push(parseFloat(num));
                }
            }
        }
        arr = numbersArray;
        if (hasStrings)
        {
            op.setUiError("notnum", "Parse Error / Not all values numerical!");
        }
    }
    outArray.set(arr);
}
