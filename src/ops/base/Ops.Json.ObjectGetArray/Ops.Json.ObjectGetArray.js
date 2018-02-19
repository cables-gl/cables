
var data=op.addInPort(new Port(op,"data",OP_PORT_TYPE_OBJECT ));
var key=op.addInPort(new Port(op,"key",OP_PORT_TYPE_VALUE,{type:'string'} ));
var result=op.addOutPort(new Port(op,"result",OP_PORT_TYPE_ARRAY));
var arrLength=op.addOutPort(new Port(op,"Length",OP_PORT_TYPE_VALUE));

result.ignoreValueSerialize=true;
data.ignoreValueSerialize=true;

data.onChange=update;
key.onChange=update;
    
function update()
{
    if(data.get() && data.get().hasOwnProperty(key.get()))
    {
        result.set(data.val[key.get()]);
        arrLength.set(result.get().length);
    }
}
