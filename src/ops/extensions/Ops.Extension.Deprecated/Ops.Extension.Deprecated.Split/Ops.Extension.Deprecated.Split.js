let inString = op.inValueString("Input String", "1,2,3");
let separator = op.inValueString("Separator", ",");

let outArray = op.outArray("Result");

separator.onChange = exec;
inString.onChange = exec;
exec();

function exec()
{
    let s = inString.get();
    if (s)
    {
        let arr = s.split(separator.get());
        outArray.set(arr);
    }
}
