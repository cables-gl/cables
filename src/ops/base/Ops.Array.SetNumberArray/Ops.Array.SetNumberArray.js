const exe=op.inTriggerButton("exe"),
    array=op.inArray("array"),
    index=op.inValueInt("index"),
    value=op.inValueFloat("value"),
    values=op.outArray("values");

exe.onTriggered=update;

var newArr=[];


function update()
{
    var arr=array.get();

    if(!Array.isArray(arr))
    {
        values.set(null);
        return;
    }

    newArr.length=arr.length;
    for(var i=0;i<arr.length;i++)newArr[i]=arr[i];

    newArr[Math.floor(index.get())]=value.get();

    values.set(null);
    values.set(newArr);
}

