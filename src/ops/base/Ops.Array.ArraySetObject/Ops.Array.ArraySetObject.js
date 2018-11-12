var exe=op.inTriggerButton("exe");

var array=op.addInPort(new CABLES.Port(op, "array",CABLES.OP_PORT_TYPE_ARRAY));
var index=op.addInPort(new CABLES.Port(op, "index",CABLES.OP_PORT_TYPE_VALUE,{type:'int'}));
var value=op.inObject("object");
var values=op.addOutPort(new CABLES.Port(op, "values",CABLES.OP_PORT_TYPE_ARRAY));
values.ignoreValueSerialize=true;

function updateIndex()
{
    if(exe.isLinked())return;
    update();
}

function update()
{
    var arr=array.get();
    if(!arr)return;
    arr[index.get()]=value.get();

    values.set(null);
    values.set(arr);
}

// index.onChange=updateIndex;
// array.onChange=updateIndex;
// value.onChange=update;
exe.onTriggered=update;
