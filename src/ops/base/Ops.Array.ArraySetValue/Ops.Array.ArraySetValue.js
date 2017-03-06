
op.name='ArraySetValue';
var exe=op.inFunctionButton("exe");

var array=op.addInPort(new Port(op, "array",OP_PORT_TYPE_ARRAY));
var index=op.addInPort(new Port(op, "index",OP_PORT_TYPE_VALUE,{type:'int'}));
var value=op.addInPort(new Port(op, "value",OP_PORT_TYPE_VALUE));
var values=op.addOutPort(new Port(op, "values",OP_PORT_TYPE_ARRAY));

function updateIndex()
{
    if(exe.isLinked())return;    
    update();
}
function update()
{
    if(!array.get())return;
    array.get()[index.get()]=value.get();

    values.set(null);
    values.set(array.get());
}

// index.onChange=updateIndex;
// array.onChange=updateIndex;
// value.onChange=update;
exe.onTriggered=update;
