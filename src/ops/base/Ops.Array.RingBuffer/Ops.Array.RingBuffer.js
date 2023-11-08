let DEFAULT_LENGTH = 10;

const
    inVal = op.inValue("Value"),
    inWrite = op.inTriggerButton("Write"),
    inNum = op.inValueInt("Length", DEFAULT_LENGTH),
    inReset = op.inTriggerButton("Reset Index"),
    outArr = op.outArray("Result"),
    outIndex = op.outNumber("Index");

let index = 0;
let arr = [];
inNum.onChange = updateLength;
updateLength();

function updateLength()
{
    arr.length = Math.floor(inNum.get());
    for (let i = 0; i < arr.length; i++) arr[i] = 0;

    outArr.setRef(arr);
}

inWrite.onTriggered = function ()
{
    index = Math.floor(index % inNum.get());
    arr[index] = inVal.get();
    outIndex.set(index);
    outArr.setRef(arr);
    index++;
};

inReset.onTriggered = function ()
{
    index = 0;
};
