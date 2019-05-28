const exe=op.inTriggerButton("exe"),
    array=op.inArray("array"),
    index=op.inValueInt("index"),
    value=op.inArray("new Array"),
    values=op.outArray("values");

values.ignoreValueSerialize=true;

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
