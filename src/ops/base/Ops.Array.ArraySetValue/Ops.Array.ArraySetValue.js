var exe=op.inFunctionButton("exe");

var array=op.addInPort(new Port(op, "array",OP_PORT_TYPE_ARRAY));
var index=op.addInPort(new Port(op, "index",OP_PORT_TYPE_VALUE,{type:'int'}));
var value=op.addInPort(new Port(op, "value",OP_PORT_TYPE_VALUE));
var values=op.addOutPort(new Port(op, "values",OP_PORT_TYPE_ARRAY));

exe.onTriggered=update;

function update()
{
    var arr=array.get();
    // console.log(arr);
    if(!Array.isArray(arr))
    {
        return;
    }
    arr[index.get()]=value.get();

    values.set(null);
    values.set(arr);
}

