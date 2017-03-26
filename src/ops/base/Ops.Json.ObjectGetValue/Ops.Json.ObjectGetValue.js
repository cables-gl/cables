op.name="getValue";

var data=op.addInPort(new Port(op,"data",OP_PORT_TYPE_OBJECT ));
var key=op.addInPort(new Port(op,"key",OP_PORT_TYPE_VALUE,{type:'string'}));
var result=op.addOutPort(new Port(op,"result"));

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
        result.set( null);
    }
}
