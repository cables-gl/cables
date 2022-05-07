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
    let s = inString.get();
    if (s)
    {
        let arr;
        if (splitNewLines.get())arr = s.split("\n");
        else arr = s.split(separator.get());

        if (forceNumbers.get())
        {
            for (let i = 0; i < arr.length; i++) arr[i] = parseFloat(arr[i]);
        }
        outArray.set(arr);
    }
}
