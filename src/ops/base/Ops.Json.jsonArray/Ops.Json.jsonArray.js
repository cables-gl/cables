var self=this;

this.name='jsonArray';

var data=this.addInPort(new Port(this,"data",OP_PORT_TYPE_OBJECT ));
var key=this.addInPort(new Port(this,"key",OP_PORT_TYPE_VALUE,{type:'string'} ));
var result=this.addOutPort(new Port(this,"result",OP_PORT_TYPE_ARRAY));
result.ignoreValueSerialize=true;
data.ignoreValueSerialize=true;

data.onValueChange(function()
{
    if(data.get() && data.get().hasOwnProperty(key.get()))
    {
        result.set(data.val[key.get()]);
        console.log( 'jsonarr length',result.get().length );
    }
});
