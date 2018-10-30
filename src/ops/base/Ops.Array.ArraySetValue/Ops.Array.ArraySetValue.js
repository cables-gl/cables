var exe=op.inTriggerButton("exe");

var array=op.addInPort(new CABLES.Port(op, "array",CABLES.OP_PORT_TYPE_ARRAY));
var index=op.addInPort(new CABLES.Port(op, "index",CABLES.OP_PORT_TYPE_VALUE,{type:'int'}));
var value=op.addInPort(new CABLES.Port(op, "value",CABLES.OP_PORT_TYPE_VALUE));
var values=op.addOutPort(new CABLES.Port(op, "values",CABLES.OP_PORT_TYPE_ARRAY));

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

