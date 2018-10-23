var data=op.addInPort(new Port(op,"data",CABLES.OP_PORT_TYPE_OBJECT ));
// var key=op.addInPort(new Port(op,"key",CABLES.OP_PORT_TYPE_VALUE,{type:'string'} ));
var key = op.inValueString("key");
var result=op.outObject("Result");

result.ignoreValueSerialize=true;
data.ignoreValueSerialize=true;

data.onChange = key.onChange = update;

function update() {
    if(data.get() && data.get().hasOwnProperty(key.get()))
    {
        result.set(data.get()[key.get()]);
    }
    else
    {
        result.set(null);
    }
}
