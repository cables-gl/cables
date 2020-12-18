const
    inString = op.inStringEditor("Input String", "1,2,3"),
    separator = op.inString("Separator", ","),
    splitNewLines = op.inBool("Split Lines", false),
    outArray = op.outArray("Result");

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
        outArray.set(arr);
    }
}
