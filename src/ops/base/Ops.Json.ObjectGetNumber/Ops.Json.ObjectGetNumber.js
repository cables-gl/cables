var data=op.inObject("data");
var key = op.inValueString("key");
const result=op.outValue("result");


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
