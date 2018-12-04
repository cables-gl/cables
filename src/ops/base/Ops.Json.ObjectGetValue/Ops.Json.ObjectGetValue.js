var data=op.addInPort(new CABLES.Port(op,"data",CABLES.OP_PORT_TYPE_OBJECT ));
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
