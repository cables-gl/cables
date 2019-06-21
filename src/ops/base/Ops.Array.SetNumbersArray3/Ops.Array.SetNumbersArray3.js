
const exe=op.inTriggerButton("exe"),
    array=op.inArray("array"),
    index=op.inValueInt("index"),
    value1=op.inValueFloat("Value 1"),
    value2=op.inValueFloat("Value 2"),
    value3=op.inValueFloat("Value 3"),
    values=op.outArray("values");

function update()
{
    if(!array.get())return;
    const idx=Math.abs(Math.floor(index.get()));
    array.get()[idx*3+0]=value1.get();
    array.get()[idx*3+1]=value2.get();
    array.get()[idx*3+2]=value3.get();

    values.set(null);
    values.set(array.get());
}

exe.onTriggered=update;
