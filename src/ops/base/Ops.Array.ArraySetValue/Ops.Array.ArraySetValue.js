const exe=op.inTriggerButton("exe"),
    array=op.inArray("array"),
    index=op.inValueInt("index"),
    value=op.inValueFloat("value"),
    values=op.outArray("values");

exe.onTriggered=update;

function update()
{
    var arr=array.get();

    if(!Array.isArray(arr))
    {
        values.set(null);
        return;
    }
    arr[index.get()]=value.get();

    values.set(null);
    values.set(arr);
}

