let inLength = op.inValueInt("Length", 100);
let inDefaultValue = op.inValueInt("DefaultValue");
let inReset = op.inTriggerButton("Reset");
let outArr = op.outArray("Array");

let arr = [];
inReset.onTriggered = reset;
inDefaultValue.onChange = reset;
inLength.onChange = function ()
{
    if (inLength.get() != arr.length)
        reset();
};

function reset()
{
    outArr.set(arr);
    let l = parseInt(inLength.get(), 10); // why this ?
    // var l=Math.floor(inLength.get());

    // if(l<0)return;
    if (l < 0)
    {
        // outArr.set(null);
        // outArr.length = 0;//this stops array resetting..
        return;
    }

    arr.length = l;

    for (let i = 0; i < l; i++)
    {
        arr[i] = inDefaultValue.get();
    }

    outArr.setRef(arr);
}

reset();
