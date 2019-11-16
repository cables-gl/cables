
const exe=op.inTriggerButton("exe"),
    array=op.inArray("array"),
    index=op.inValueInt("index"),
    value1=op.inValueFloat("Value 1"),
    value2=op.inValueFloat("Value 2"),
    value3=op.inValueFloat("Value 3"),
    values=op.outArray("values");

var newArr=[];

function update()
{
    var arr=array.get();
    if(!arr)return;

    newArr.length=arr.length;
    for(var i=0;i<arr.length;i++) newArr[i]=arr[i];

    const idx=3*Math.abs(Math.floor(index.get()));
    newArr[idx+0]=value1.get();
    newArr[idx+1]=value2.get();
    newArr[idx+2]=value3.get();

    values.set(null);
    values.set(newArr);
}

exe.onTriggered=update;
