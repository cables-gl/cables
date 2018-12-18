const
    inString = op.inString("Input String","1,2,3"),
    separator = op.inString("Separator", ","),
    outArray=op.outArray("Result");

separator.onChange =
    inString.onChange = exec;

exec();

function exec()
{
    var s = inString.get();
    if(s)
    {
        var arr = s.split(separator.get());
        outArray.set(arr);
    }
}
