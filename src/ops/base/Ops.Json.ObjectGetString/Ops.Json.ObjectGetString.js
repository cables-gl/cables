var data=op.inObject("data");
var key = op.inString("Key");
const result=op.outString("Result");

result.ignoreValueSerialize=true;
data.ignoreValueSerialize=true;

key.onChange=exec;
data.onChange=exec;

function exec()
{
    if(data.get() && data.get().hasOwnProperty(key.get()))
    {
        result.set( data.get()[key.get()] );
    }
    else
    {
        result.set(null);
    }
}
