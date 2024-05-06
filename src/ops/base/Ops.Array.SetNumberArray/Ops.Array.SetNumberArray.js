const exe = op.inTriggerButton("exe"),
    array = op.inArray("array"),
    index = op.inValueInt("index"),
    value = op.inValueFloat("value"),
    next = op.outTrigger("Next"),
    values = op.outArray("values");

exe.onTriggered = update;

let newArr = [];

function update()
{
    let arr = array.get();

    if (!Array.isArray(arr))
    {
        values.set(null);
        return;
    }

    newArr.length = arr.length;
    for (let i = 0; i < arr.length; i++)newArr[i] = arr[i];

    newArr[Math.floor(index.get())] = value.get();

    values.setRef(newArr);
    next.trigger();
}
