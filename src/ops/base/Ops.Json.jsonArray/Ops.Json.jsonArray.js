op.name='jsonArray';

var data=op.addInPort(new Port(op,"data",OP_PORT_TYPE_OBJECT ));
var key=op.addInPort(new Port(op,"key",OP_PORT_TYPE_VALUE,{type:'string'} ));
var result=op.addOutPort(new Port(op,"result",OP_PORT_TYPE_ARRAY));

result.ignoreValueSerialize=true;
data.ignoreValueSerialize=true;

data.onValueChange(function()
{
    if(data.get() && data.get().hasOwnProperty(key.get()))
    {
        result.set(data.val[key.get()]);
        // console.log( 'jsonarr length',result.get().length );
    }
});
