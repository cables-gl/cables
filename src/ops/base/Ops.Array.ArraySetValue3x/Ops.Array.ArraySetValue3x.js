op.name="ArraySetValue3x";

var exe=op.inFunctionButton("exe");

var array=op.addInPort(new Port(op, "array",OP_PORT_TYPE_ARRAY));
var index=op.addInPort(new Port(op, "index",OP_PORT_TYPE_VALUE,{type:'int'}));
var value1=op.addInPort(new Port(op, "Value 1",OP_PORT_TYPE_VALUE));
var value2=op.addInPort(new Port(op, "Value 2",OP_PORT_TYPE_VALUE));
var value3=op.addInPort(new Port(op, "Value 3",OP_PORT_TYPE_VALUE));
var values=op.addOutPort(new Port(op, "values",OP_PORT_TYPE_ARRAY));

function updateIndex()
{
    if(exe.isLinked())return;    
    update();
}
function update()
{
    if(!array.get())return;
    array.get()[index.get()*3+0]=value1.get();
    array.get()[index.get()*3+1]=value2.get();
    array.get()[index.get()*3+2]=value3.get();

    values.set(null);
    values.set(array.get());
}

// index.onChange=updateIndex;
// array.onChange=updateIndex;
// value.onChange=update;
exe.onTriggered=update;
