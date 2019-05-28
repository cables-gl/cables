
const exe=op.inTriggerButton("exe"),
    array=op.inArray("array"),
    index=op.inValueInt("index"),
    value1=op.inValueFloat("Value 1"),
    value2=op.inValueFloat("Value 2"),
    value3=op.inValueFloat("Value 3"),
    values=op.outArray("values");

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
