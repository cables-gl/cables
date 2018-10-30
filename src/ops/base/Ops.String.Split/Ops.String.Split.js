var inString = op.inValueString("Input String","1,2,3");
var separator = op.inValueString("Separator", ",");

var outArray=op.outArray("Result");

separator.onChange = exec;
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
