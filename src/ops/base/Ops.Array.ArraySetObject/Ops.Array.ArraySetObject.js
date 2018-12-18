const
    exe=op.inTriggerButton("exe"),
    array=op.inArray("array"),
    index=op.inValueInt("index"),
    value=op.inObject("object"),
    values=op.outArray("values");

values.ignoreValueSerialize=true;
exe.onTriggered=update;

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

